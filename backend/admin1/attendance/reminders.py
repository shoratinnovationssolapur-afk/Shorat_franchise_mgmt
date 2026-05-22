from datetime import time

from django.utils import timezone

from admin1.add_staff.models import Staff
from admin1.notifications.models import Notification

from .models import StaffAttendance


def create_attendance_reminders(kind, reminder_date=None, user=None):
    reminder_date = reminder_date or timezone.localdate()
    reminder_time = time(9, 0) if kind == "clock_in" else time(18, 0)
    created_count = 0
    skipped_count = 0

    staff_qs = Staff.objects.select_related("user", "franchise").filter(
        status="Active",
        user__isnull=False,
    )
    if user is not None:
        if getattr(user, "role", None) == "staff":
            staff_qs = staff_qs.filter(user=user)
        elif getattr(user, "role", None) == "franchise_head":
            staff_qs = staff_qs.filter(franchise__user=user)

    for staff in staff_qs:
        attendance = StaffAttendance.objects.filter(
            staff=staff,
            date=reminder_date,
        ).first()

        if kind == "clock_in":
            should_notify = not attendance or not attendance.in_time
            message = "Please add your in time for today's attendance."
        elif kind == "clock_out":
            should_notify = (
                not attendance
                or (attendance.status != "WFH" and not attendance.out_time)
            )
            message = "Please add your out time for today's attendance."
        else:
            raise ValueError("kind must be 'clock_in' or 'clock_out'")

        if not should_notify:
            skipped_count += 1
            continue

        reminder_key = f"attendance:{reminder_date:%Y-%m-%d}:{kind}:{staff.id}"
        _, created = Notification.objects.get_or_create(
            user=staff.user,
            reminder_key=reminder_key,
            defaults={
                "message": message,
                "notification_type": "attendance_reminder",
            },
        )
        if created:
            created_count += 1
        else:
            skipped_count += 1

    return {
        "kind": kind,
        "date": reminder_date.isoformat(),
        "time": reminder_time.strftime("%H:%M"),
        "created": created_count,
        "skipped": skipped_count,
    }
