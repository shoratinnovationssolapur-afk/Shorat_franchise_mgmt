from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from admin1.add_staff.models import Staff
from admin1.add_franchise.models import AddFranchise
from admin1.notifications.models import Notification
from .models import StaffLeaveRequest
from .serializers import StaffLeaveRequestSerializer


FRANCHISE_APPROVAL_CHANGE_SECONDS = 10


def applicant_label(leave_request):
    if leave_request.applicant_type == "Staff" and leave_request.staff:
        return leave_request.staff.name
    return leave_request.franchise.name


def notify_leave(message):
    Notification.objects.create(message=message)


def franchise_approval_window_expired(leave_request):
    if leave_request.status != "Approved" or not leave_request.franchise_approved_at:
        return False
    elapsed = (timezone.now() - leave_request.franchise_approved_at).total_seconds()
    return elapsed > FRANCHISE_APPROVAL_CHANGE_SECONDS


class StaffLeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = StaffLeaveRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = StaffLeaveRequest.objects.select_related("staff", "staff__user", "franchise")

        staff_id = self.request.query_params.get("staff")
        status_filter = self.request.query_params.get("status")
        branch = self.request.query_params.get("branch")

        if getattr(user, "role", None) == "staff":
            queryset = queryset.filter(staff__user=user)
        elif hasattr(user, "franchise") and user.franchise:
            queryset = queryset.filter(franchise=user.franchise)

        applicant_type = self.request.query_params.get("applicant_type")
        if staff_id:
            queryset = queryset.filter(staff_id=staff_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if branch:
            queryset = queryset.filter(franchise__name=branch)
        if applicant_type:
            queryset = queryset.filter(applicant_type=applicant_type)

        return queryset

    def create(self, request, *args, **kwargs):
        if getattr(request.user, "role", None) == "staff":
            try:
                staff = Staff.objects.select_related("franchise").get(user=request.user)
            except Staff.DoesNotExist:
                return Response(
                    {"error": "Only staff users can apply for staff leave."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(
                staff=staff,
                franchise=staff.franchise,
                applicant_type="Staff",
                status="Pending",
            )
            notify_leave(
                f"Leave request submitted by staff '{staff.name}' for {staff.franchise.name}."
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        if getattr(request.user, "role", None) == "franchise_head":
            try:
                franchise = AddFranchise.objects.get(user=request.user)
            except AddFranchise.DoesNotExist:
                return Response(
                    {"error": "No franchise is linked to this user."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save(
                staff=None,
                franchise=franchise,
                applicant_type="Franchise",
                status="Pending",
            )
            notify_leave(
                f"Leave request submitted by franchise '{franchise.name}'."
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(
            {"error": "Admins can review leave requests but cannot apply here."},
            status=status.HTTP_403_FORBIDDEN,
        )

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        role = getattr(user, "role", None)

        status_is_changing = "status" in request.data and request.data.get("status") != instance.status
        note_is_changing = (
            "reviewer_note" in request.data
            and request.data.get("reviewer_note", "") != instance.reviewer_note
        )

        if role in {"admin", "franchise_head"} and (status_is_changing or note_is_changing):
            if instance.status == "Withdrawn":
                return Response(
                    {"error": "Withdrawn leave requests cannot be changed."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if franchise_approval_window_expired(instance):
                return Response(
                    {
                        "error": (
                            "This leave was approved by franchise more than "
                            "10 seconds ago and can no longer be changed."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if role == "staff":
            if request.data.get("status") == "Withdrawn":
                if instance.status != "Pending":
                    return Response(
                        {"error": "Only pending leave requests can be withdrawn."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                data = {"status": "Withdrawn"}
            else:
                allowed = {"leave_type", "start_date", "end_date", "reason"}
                if instance.status != "Pending":
                    return Response(
                        {"error": "Only pending leave requests can be edited."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                data = {key: value for key, value in request.data.items() if key in allowed}
        elif role == "franchise_head":
            if instance.applicant_type == "Franchise":
                allowed = {"leave_type", "start_date", "end_date", "reason"}
                if instance.status != "Pending":
                    return Response(
                        {"error": "Only pending leave requests can be edited."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                data = {key: value for key, value in request.data.items() if key in allowed}
            else:
                data = {
                    key: value
                    for key, value in request.data.items()
                    if key in {"status", "reviewer_note"}
                }
        else:
            data = request.data

        if not data:
            return Response(
                {"error": "No allowed fields were provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        old_status = instance.status
        old_note = instance.reviewer_note
        new_status = data.get("status", old_status)
        save_kwargs = {}

        if role == "franchise_head" and old_status != "Approved" and new_status == "Approved":
            save_kwargs["franchise_approved_at"] = timezone.now()
        elif "status" in data and new_status != "Approved":
            save_kwargs["franchise_approved_at"] = None

        saved = serializer.save(**save_kwargs)

        if "status" in data and old_status != saved.status:
            notify_leave(
                f"Leave request for '{applicant_label(saved)}' was {saved.status.lower()} by {role.replace('_', ' ')}."
            )
        elif "reviewer_note" in data and old_note != saved.reviewer_note:
            notify_leave(
                f"Reviewer note updated for '{applicant_label(saved)}' leave request."
            )
        return Response(serializer.data)
