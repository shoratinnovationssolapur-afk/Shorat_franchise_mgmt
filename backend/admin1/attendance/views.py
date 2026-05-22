# backend/admin1/attendance/views.py
from math import atan2, cos, radians, sin, sqrt

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from admin1.add_staff.models import Staff
from .models import StaffAttendance, StudentAttendance
from .serializers import StaffAttendanceSerializer, StudentAttendanceSerializer
from datetime import datetime, date as date_class


def distance_meters(lat1, lon1, lat2, lon2):
    earth_radius_meters = 6371000
    lat1 = radians(float(lat1))
    lon1 = radians(float(lon1))
    lat2 = radians(float(lat2))
    lon2 = radians(float(lon2))
    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1
    a = sin(delta_lat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(delta_lon / 2) ** 2
    return earth_radius_meters * 2 * atan2(sqrt(a), sqrt(1 - a))


class StaffAttendanceViewSet(viewsets.ModelViewSet):
    queryset = StaffAttendance.objects.all()
    serializer_class = StaffAttendanceSerializer
    permission_classes = [IsAuthenticated]

    def _deny_franchise_write(self, request):
        if getattr(request.user, "role", None) == "franchise_head":
            return Response(
                {"error": "Franchise users cannot create or edit staff attendance times."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return None

    def _deny_absent_to_wfh(self, existing, new_status):
        if existing and existing.status == "Absent" and new_status == "WFH":
            return Response(
                {"error": "Absent attendance cannot be changed to WFH."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return None

    def _deny_future_date(self, attendance_date):
        if not attendance_date:
            return None
        parsed_date = (
            datetime.strptime(attendance_date, "%Y-%m-%d").date()
            if isinstance(attendance_date, str)
            else attendance_date
        )
        if parsed_date > date_class.today():
            return Response(
                {"error": "Attendance can only be marked for today or a past date."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return None

    def _deny_wfh_clock_in(self, existing, in_time):
        if existing and existing.status == "WFH" and in_time:
            return Response(
                {"error": "WFH attendance cannot be changed to clock-in attendance."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return None

    def _validate_office_location(self, staff_id, latitude, longitude, action_label):
        try:
            staff = Staff.objects.select_related("franchise").get(id=staff_id)
        except Staff.DoesNotExist:
            return Response(
                {"error": "Staff record was not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        franchise = staff.franchise
        if franchise.office_latitude is None or franchise.office_longitude is None:
            return Response(
                {"error": "Office coordinates are not configured for this franchise."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if latitude is None or longitude is None:
            return Response(
                {"error": f"Location permission is required to {action_label} from office premises."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        distance = distance_meters(
            latitude,
            longitude,
            franchise.office_latitude,
            franchise.office_longitude,
        )
        if distance > franchise.office_radius_meters:
            return Response(
                {
                    "error": f"You can {action_label} only from office premises.",
                    "distance_meters": round(distance, 2),
                    "allowed_radius_meters": franchise.office_radius_meters,
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        return None

    def create(self, request, *args, **kwargs):
        denied = self._deny_franchise_write(request)
        if denied:
            return denied

        print("Received data:", request.data)
        payload = request.data
        if not isinstance(payload, list):
            payload = [payload]
        results = []

        for record in payload:
            staff_id = record.get("staff")
            date = record.get("date")
            existing = StaffAttendance.objects.filter(staff_id=staff_id, date=date).first()
            requested_status = record.get("status", existing.status if existing else "Present")

            denied = self._deny_future_date(date)
            if denied:
                return denied

            denied = self._deny_absent_to_wfh(existing, requested_status)
            if denied:
                return denied

            denied = self._deny_wfh_clock_in(existing, record.get("in_time"))
            if denied:
                return denied

            if record.get("in_time") and (not existing or not existing.in_time):
                denied = self._validate_office_location(
                    staff_id,
                    record.get("latitude"),
                    record.get("longitude"),
                    "clock in",
                )
                if denied:
                    return denied

            if record.get("out_time") and (not existing or not existing.out_time):
                denied = self._validate_office_location(
                    staff_id,
                    record.get("latitude"),
                    record.get("longitude"),
                    "clock out",
                )
                if denied:
                    return denied

            # Check if attendance already exists
            obj, created = StaffAttendance.objects.update_or_create(
                staff_id=staff_id,
                date=date,
                defaults={
                    "in_time": record.get("in_time", existing.in_time if existing else None),
                    "out_time": record.get("out_time", existing.out_time if existing else None),
                    "status": requested_status,
                    "branch": record.get("branch", "Unknown"),
                },
            )

            serializer = self.get_serializer(obj)
            results.append(serializer.data)

        return Response(results, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        denied = self._deny_franchise_write(request)
        if denied:
            return denied
        instance = self.get_object()
        if request.data.get("in_time") and request.data.get("in_time") != instance.in_time:
            denied = self._validate_office_location(
                instance.staff_id,
                request.data.get("latitude"),
                request.data.get("longitude"),
                "clock in",
            )
            if denied:
                return denied
        if request.data.get("out_time") and request.data.get("out_time") != instance.out_time:
            denied = self._validate_office_location(
                instance.staff_id,
                request.data.get("latitude"),
                request.data.get("longitude"),
                "clock out",
            )
            if denied:
                return denied
        denied = self._deny_future_date(request.data.get("date", self.get_object().date))
        if denied:
            return denied
        denied = self._deny_absent_to_wfh(self.get_object(), request.data.get("status"))
        if denied:
            return denied
        denied = self._deny_wfh_clock_in(self.get_object(), request.data.get("in_time"))
        if denied:
            return denied
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        denied = self._deny_franchise_write(request)
        if denied:
            return denied
        instance = self.get_object()
        if request.data.get("in_time") and request.data.get("in_time") != instance.in_time:
            denied = self._validate_office_location(
                instance.staff_id,
                request.data.get("latitude"),
                request.data.get("longitude"),
                "clock in",
            )
            if denied:
                return denied
        if request.data.get("out_time") and request.data.get("out_time") != instance.out_time:
            denied = self._validate_office_location(
                instance.staff_id,
                request.data.get("latitude"),
                request.data.get("longitude"),
                "clock out",
            )
            if denied:
                return denied
        denied = self._deny_future_date(request.data.get("date", self.get_object().date))
        if denied:
            return denied
        denied = self._deny_absent_to_wfh(self.get_object(), request.data.get("status"))
        if denied:
            return denied
        denied = self._deny_wfh_clock_in(self.get_object(), request.data.get("in_time"))
        if denied:
            return denied
        return super().partial_update(request, *args, **kwargs)

    def get_queryset(self):
        queryset = StaffAttendance.objects.all()
        date = self.request.query_params.get("date")
        branch = self.request.query_params.get("branch")
        staff_id = self.request.query_params.get("staff")
        if date:
            queryset = queryset.filter(date=date)
        if branch:
            queryset = queryset.filter(branch=branch)
        if staff_id:
            queryset = queryset.filter(staff_id=staff_id)
        return queryset


class StudentAttendanceViewSet(viewsets.ModelViewSet):
    queryset = StudentAttendance.objects.all()
    serializer_class = StudentAttendanceSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        # Supports bulk upsert from a list of attendance records
        payload = request.data
        if not isinstance(payload, list):
            payload = [payload]

        results = []
        for record in payload:
            student_id = record.get("student")
            date = record.get("date")
            obj, created = StudentAttendance.objects.update_or_create(
                student_id=student_id,
                date=date,
                defaults={
                    "in_time": record.get("in_time"),
                    "out_time": record.get("out_time"),
                    "status": record.get("status"),
                    "branch": record.get("branch", "Unknown"),
                    "batch": record.get("batch"),
                },
            )
            results.append(self.get_serializer(obj).data)

        return Response(results, status=status.HTTP_200_OK)

    def get_queryset(self):
        queryset = StudentAttendance.objects.all()
        date = self.request.query_params.get("date")
        branch = self.request.query_params.get("branch")
        batch = self.request.query_params.get("batch")
        student_id = self.request.query_params.get("student")
        if date:
            queryset = queryset.filter(date=date)
        if branch:
            queryset = queryset.filter(branch=branch)
        if batch:
            queryset = queryset.filter(batch=batch)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        return queryset
    
from django.db.models import Count, Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import StaffAttendance, StudentAttendance
from .reminders import create_attendance_reminders

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def monthly_summary(request):
    month = request.GET.get('month')  # Get month from query params
    if not month:
        month = datetime.now().month
    else:
        month = int(month)

    # Optional filters
    staff_id = request.GET.get('staff')
    branch = request.GET.get('branch')

    # Filter by month and optional params
    records = StaffAttendance.objects.filter(date__month=month)
    if staff_id:
        records = records.filter(staff_id=staff_id)
    if branch:
        records = records.filter(branch=branch)

    # Aggregate summary
    summary = records.values('staff__id', 'staff__name').annotate(
        present=Count('id', filter=Q(status='Present')),
        absent=Count('id', filter=Q(status='Absent')),
        half_day=Count('id', filter=Q(status='Half Day')),
        wfh=Count('id', filter=Q(status='WFH'))
    )

    return Response(summary)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def student_monthly_summary(request):
    """
    Returns per-student counts for the given month (and optional branch) with keys used by frontend:
    student__id, student__name, present, absent, half_day, leave
    """
    month = request.GET.get('month')
    if not month:
        month = datetime.now().month
    else:
        month = int(month)

    branch = request.GET.get('branch')

    qs = StudentAttendance.objects.filter(date__month=month)
    if branch:
        qs = qs.filter(branch=branch)

    summary = qs.values('student__id', 'student__name').annotate(
        present=Count('id', filter=Q(status='Present')),
        absent=Count('id', filter=Q(status='Absent')),
        half_day=Count('id', filter=Q(status='Half Day')),
        leave=Count('id', filter=Q(status='Leave')),
    )

    return Response(summary)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_attendance_reminders(request):
    if getattr(request.user, "role", None) not in {"admin", "franchise_head", "staff"}:
        return Response({"error": "Only authenticated app users can generate reminders."}, status=403)
    kind = request.data.get("kind")
    if kind not in {"clock_in", "clock_out"}:
        return Response({"error": "kind must be clock_in or clock_out."}, status=400)
    return Response(create_attendance_reminders(kind, user=request.user))
