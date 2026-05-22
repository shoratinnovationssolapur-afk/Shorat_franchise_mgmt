from django.contrib import admin
from .models import StaffAttendance, StudentAttendance

@admin.register(StaffAttendance)
class StaffAttendanceAdmin(admin.ModelAdmin):
    list_display = ('staff', 'date', 'in_time', 'out_time', 'status', 'branch')
    list_filter = ('date', 'status', 'branch')
    search_fields = ('staff__name', 'branch')


@admin.register(StudentAttendance)
class StudentAttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'date', 'in_time', 'out_time', 'status', 'branch', 'batch')
    list_filter = ('date', 'status', 'branch', 'batch')
    search_fields = ('student__name', 'branch', 'batch')
