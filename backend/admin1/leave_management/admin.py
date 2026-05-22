from django.contrib import admin
from .models import StaffLeaveRequest


@admin.register(StaffLeaveRequest)
class StaffLeaveRequestAdmin(admin.ModelAdmin):
    list_display = ("staff", "franchise", "leave_type", "start_date", "end_date", "status")
    list_filter = ("status", "leave_type", "franchise")
    search_fields = ("staff__name", "staff__user__email", "reason")
