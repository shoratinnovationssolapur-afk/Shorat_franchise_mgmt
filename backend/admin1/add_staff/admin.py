from django.contrib import admin
from .models import Staff

@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "role", "franchise", "phone", "salary", "status")
    list_filter = ("role", "status", "franchise")
    search_fields = ("name", "phone", "user__email")
    ordering = ("id",)
