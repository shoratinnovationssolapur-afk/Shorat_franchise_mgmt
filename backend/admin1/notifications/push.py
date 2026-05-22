import json
import logging

from django.conf import settings

from .models import WebPushSubscription

logger = logging.getLogger(__name__)


def _webpush_configured():
    return bool(
        getattr(settings, "WEB_PUSH_VAPID_PRIVATE_KEY", "")
        and getattr(settings, "WEB_PUSH_VAPID_CLAIMS", {}).get("sub")
    )


def send_notification_push(notification):
    if not notification.user_id or not _webpush_configured():
        return

    try:
        from pywebpush import WebPushException, webpush
    except ImportError:
        logger.warning("pywebpush is not installed; skipping push notification.")
        return

    payload = json.dumps(
        {
            "title": "Shorat Connect",
            "body": notification.message,
            "tag": notification.reminder_key or f"notification-{notification.id}",
            "url": "/",
        }
    )

    subscriptions = WebPushSubscription.objects.filter(
        user=notification.user,
        active=True,
    )
    for subscription in subscriptions:
        try:
            webpush(
                subscription_info={
                    "endpoint": subscription.endpoint,
                    "keys": {
                        "p256dh": subscription.p256dh,
                        "auth": subscription.auth,
                    },
                },
                data=payload,
                vapid_private_key=settings.WEB_PUSH_VAPID_PRIVATE_KEY,
                vapid_claims=settings.WEB_PUSH_VAPID_CLAIMS,
            )
        except WebPushException as exc:
            status_code = getattr(getattr(exc, "response", None), "status_code", None)
            if status_code in {404, 410}:
                subscription.active = False
                subscription.save(update_fields=["active", "updated_at"])
            logger.warning("Web push failed for subscription %s: %s", subscription.id, exc)
