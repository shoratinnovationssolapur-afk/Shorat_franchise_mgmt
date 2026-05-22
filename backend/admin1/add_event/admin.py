from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "location", "start_date", "end_date", "status", "created_at")
    list_filter = ("status", "start_date", "end_date")
    search_fields = ("name", "location")
    ordering = ("-start_date",)
