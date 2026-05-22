from django.contrib import admin
from .models import Student

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "phone", "get_batches", "franchise", "total_fees", "fees_paid", "status")
    list_filter = ("status", "franchise")
    search_fields = ("name", "email", "phone")

    def get_batches(self, obj):
        return ", ".join([b.name for b in obj.batches.all()])
    
    get_batches.short_description = "Batches"