# from rest_framework import serializers
# from .models import Notification

# class NotificationSerializer(serializers.ModelSerializer):
#     franchiseId = serializers.IntegerField(source="franchise.id", read_only=True)
#     franchiseName = serializers.CharField(source="franchise.name", read_only=True)

#     class Meta:
#         model = Notification
#         fields = ["id", "message", "is_read", "created_at", "franchiseId", "franchiseName"]

from rest_framework import serializers
from .models import Notification, WebPushSubscription


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification

        fields = ["id", "user", "message", "notification_type", "reminder_key", "is_read", "created_at"]
        read_only_fields = ["user", "reminder_key"]


class WebPushSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebPushSubscription
        fields = ["id", "endpoint", "p256dh", "auth", "active", "created_at", "updated_at"]
        read_only_fields = ["id", "active", "created_at", "updated_at"]

    def to_internal_value(self, data):
        data = data.copy()
        keys = data.get("keys") or {}
        if "p256dh" not in data and keys.get("p256dh"):
            data["p256dh"] = keys["p256dh"]
        if "auth" not in data and keys.get("auth"):
            data["auth"] = keys["auth"]
        return super().to_internal_value(data)
