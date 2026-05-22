from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import Notification, WebPushSubscription
from .serializers import NotificationSerializer, WebPushSubscriptionSerializer
from rest_framework import status

from rest_framework.permissions import AllowAny

from django.shortcuts import get_object_or_404
@api_view(["GET"])
@permission_classes([IsAuthenticatedOrReadOnly])
def list_notifications(request):
    qs = Notification.objects.all()
    if request.user.is_authenticated and getattr(request.user, "role", None) == "staff":
        qs = qs.filter(user=request.user)
    elif request.user.is_authenticated:
        qs = qs.filter(user__isnull=True) | qs.filter(user=request.user)
    else:
        qs = qs.filter(user__isnull=True)
    qs = qs.order_by("-created_at")
    serializer = NotificationSerializer(qs, many=True)
    return Response(serializer.data)



@api_view(["POST"])
@permission_classes([AllowAny])
def mark_read(request, pk):
    qs = Notification.objects.all()
    if request.user.is_authenticated and getattr(request.user, "role", None) == "staff":
        qs = qs.filter(user=request.user)
    notification = get_object_or_404(qs, pk=pk)
    notification.is_read = True
    notification.save(update_fields=["is_read"])
    return Response({"status": "ok", "id": pk, "is_read": notification.is_read})

@api_view(["POST"])
@permission_classes([AllowAny])
def mark_all_read(request):
    qs = Notification.objects.filter(is_read=False)
    if request.user.is_authenticated and getattr(request.user, "role", None) == "staff":
        qs = qs.filter(user=request.user)
    qs.update(is_read=True)
    return Response({"status": "success"})


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def push_subscriptions(request):
    if request.method == "DELETE":
        endpoint = request.data.get("endpoint")
        if not endpoint:
            return Response({"error": "endpoint is required."}, status=status.HTTP_400_BAD_REQUEST)
        WebPushSubscription.objects.filter(user=request.user, endpoint=endpoint).update(active=False)
        return Response({"status": "disabled"})

    serializer = WebPushSubscriptionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    subscription, _ = WebPushSubscription.objects.update_or_create(
        endpoint=serializer.validated_data["endpoint"],
        defaults={
            "user": request.user,
            "p256dh": serializer.validated_data["p256dh"],
            "auth": serializer.validated_data["auth"],
            "user_agent": request.META.get("HTTP_USER_AGENT", ""),
            "active": True,
        },
    )
    return Response(WebPushSubscriptionSerializer(subscription).data, status=status.HTTP_201_CREATED)
