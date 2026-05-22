# attendance/serializers.py
from rest_framework import serializers
from .models import StaffAttendance, StudentAttendance

class StaffAttendanceSerializer(serializers.ModelSerializer):
    staff_name = serializers.CharField(source="staff.name", read_only=True)
    hours_worked = serializers.SerializerMethodField()

    class Meta:
        model = StaffAttendance
        fields = "__all__"

    def get_hours_worked(self, obj):
        return obj.hours_worked


class StudentAttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.name", read_only=True)
    hours_worked = serializers.SerializerMethodField()

    class Meta:
        model = StudentAttendance
        fields = "__all__"

    def get_hours_worked(self, obj):
        return obj.hours_worked
