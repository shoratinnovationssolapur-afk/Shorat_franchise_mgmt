from rest_framework import serializers
from django.utils import timezone
from .models import StaffLeaveRequest


class StaffLeaveRequestSerializer(serializers.ModelSerializer):
    FRANCHISE_APPROVAL_CHANGE_SECONDS = 10

    staff_name = serializers.SerializerMethodField()
    staff_email = serializers.SerializerMethodField()
    franchise_name = serializers.SerializerMethodField()
    franchise_email = serializers.SerializerMethodField()
    applicant_name = serializers.SerializerMethodField()
    applicant_email = serializers.SerializerMethodField()
    total_days = serializers.IntegerField(read_only=True)
    status_change_locked = serializers.SerializerMethodField()
    status_change_seconds_left = serializers.SerializerMethodField()

    class Meta:
        model = StaffLeaveRequest
        fields = "__all__"
        read_only_fields = [
            "staff",
            "franchise",
            "applicant_type",
            "franchise_approved_at",
            "created_at",
            "updated_at",
        ]

    def get_status_change_seconds_left(self, obj):
        if not obj.franchise_approved_at or obj.status != "Approved":
            return None

        elapsed = (timezone.now() - obj.franchise_approved_at).total_seconds()
        return max(0, self.FRANCHISE_APPROVAL_CHANGE_SECONDS - int(elapsed))

    def get_status_change_locked(self, obj):
        seconds_left = self.get_status_change_seconds_left(obj)
        return seconds_left == 0 if seconds_left is not None else False

    def get_applicant_name(self, obj):
        if obj.applicant_type == "Staff" and obj.staff:
            return obj.staff.name
        return obj.franchise.name

    def get_applicant_email(self, obj):
        if obj.applicant_type == "Staff" and obj.staff and obj.staff.user:
            return obj.staff.user.email
        if obj.franchise.user:
            return obj.franchise.user.email
        return ""

    def get_staff_name(self, obj):
        return obj.staff.name if obj.staff else ""

    def get_staff_email(self, obj):
        return obj.staff.user.email if obj.staff and obj.staff.user else ""

    def get_franchise_name(self, obj):
        return obj.franchise.name if obj.franchise else ""

    def get_franchise_email(self, obj):
        return obj.franchise.user.email if obj.franchise and obj.franchise.user else ""

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))
        today = timezone.localdate()
        if (self.instance is None or "start_date" in attrs) and start_date and start_date < today:
            raise serializers.ValidationError({"start_date": "Start date cannot be in the past."})
        if (self.instance is None or "end_date" in attrs) and end_date and end_date < today:
            raise serializers.ValidationError({"end_date": "End date cannot be in the past."})
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "End date cannot be earlier than start date."})
        return attrs
