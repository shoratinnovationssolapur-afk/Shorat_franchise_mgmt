from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    StaffAttendanceViewSet,
    StudentAttendanceViewSet,
    monthly_summary,
    student_monthly_summary,
    generate_attendance_reminders,
)

router = DefaultRouter()
router.register(r'staff-attendance', StaffAttendanceViewSet, basename='staff-attendance')
router.register(r'student-attendance', StudentAttendanceViewSet, basename='student-attendance')

urlpatterns = [
    path('', include(router.urls)),
    path("monthly-summary/", monthly_summary, name="monthly-summary"),
    path("student-monthly-summary/", student_monthly_summary, name="student-monthly-summary"),
    path("generate-reminders/", generate_attendance_reminders, name="generate-attendance-reminders"),



]
