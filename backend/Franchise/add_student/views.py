from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from rest_framework import status
from .models import Student
from .serializers import StudentSerializer
from .reminders import (
    get_pending_amount,
    send_fee_receipt as send_student_fee_receipt,
    send_fee_reminder as send_student_fee_reminder,
)

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer

    def get_queryset(self):
        user = self.request.user

        # Prevent crash for anonymous users
        if not user.is_authenticated:
            return Student.objects.none()

        # Admin sees all students
        if getattr(user, "role", None) == "admin":
            return Student.objects.all().order_by("-created_at")

        # Franchise head or staff sees only students from their franchise
        franchise = getattr(user, "franchise", None)
        if franchise:
            return Student.objects.filter(franchise=franchise).order_by("-created_at")

        # Default empty queryset
        return Student.objects.none()

    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user

        if not user.is_authenticated:
            return Response({
                "total_students": 0,
                "active_students": 0,
                "inactive_students": 0,
                "total_fees_paid": 0
            })

        # Admin: all students
        if getattr(user, "role", None) == "admin":
            students = Student.objects.all()
        else:
            # Franchise head / staff: only their franchise
            franchise = getattr(user, "franchise", None)
            students = Student.objects.filter(franchise=franchise) if franchise else Student.objects.none()

        total_fees_paid = students.aggregate(total=Sum('fees_paid'))['total'] or 0

        data = {
            "total_students": students.count(),
            "active_students": students.filter(status="Active").count(),
            "inactive_students": students.filter(status="Inactive").count(),
            "total_fees_paid": total_fees_paid,
        }

        return Response(data)

    @action(detail=True, methods=["post"], url_path="send-fee-reminder")
    def send_fee_reminder(self, request, pk=None):
        student = self.get_object()
        result = send_student_fee_reminder(student)
        response_status = status.HTTP_200_OK if result.get("sent") else status.HTTP_400_BAD_REQUEST
        return Response(result, status=response_status)

    @action(detail=True, methods=["post"], url_path="send-fee-receipt")
    def send_fee_receipt(self, request, pk=None):
        student = self.get_object()
        result = send_student_fee_receipt(student)
        response_status = status.HTTP_200_OK if result.get("sent") else status.HTTP_400_BAD_REQUEST
        return Response(result, status=response_status)

    @action(detail=False, methods=["post"], url_path="send-pending-fee-reminders")
    def send_pending_fee_reminders(self, request):
        students = [
            student
            for student in self.get_queryset()
            if get_pending_amount(student) > 0
        ]

        results = [send_student_fee_reminder(student) for student in students]
        sent_count = sum(1 for result in results if result.get("sent"))

        return Response({
            "total_pending_students": len(students),
            "sent": sent_count,
            "failed": len(results) - sent_count,
            "results": results,
        })
