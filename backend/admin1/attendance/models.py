# backend/admin1/attendance/models.py

from datetime import date, datetime, timedelta
from django.db import models
from admin1.add_staff.models import Staff
from Franchise.add_student.models import Student


# ------------------------
# Utility Functions

def _attendance_duration(in_time, out_time):
    # ✅ Prevent crash if None
    if not in_time or not out_time:
        return None

    # ✅ Convert string → time
    if isinstance(in_time, str):
        in_time = datetime.strptime(
            in_time, "%H:%M:%S" if len(in_time.split(":")) == 3 else "%H:%M"
        ).time()
    if isinstance(out_time, str):
        out_time = datetime.strptime(
            out_time, "%H:%M:%S" if len(out_time.split(":")) == 3 else "%H:%M"
        ).time()

    start = datetime.combine(date.today(), in_time)
    end = datetime.combine(date.today(), out_time)

    # ✅ Handle overnight case
    if end < start:
        end += timedelta(days=1)

    return end - start


def _as_time(value):
    if isinstance(value, str):
        return datetime.strptime(
            value, "%H:%M:%S" if len(value.split(":")) == 3 else "%H:%M"
        ).time()
    return value


def _auto_attendance_status(in_time, out_time):
    duration = _attendance_duration(in_time, out_time)

    if duration:
        hours = duration.total_seconds() / 3600.0
        if hours < 3:
            return 'Absent'
        if hours < 7:
            return 'Half Day'
        if hours >= 7:
            return 'Present'

    if in_time and not out_time:
        return 'Present'

    if out_time:
        return 'Absent'

    return None


# ------------------------
# Staff Attendance

class StaffAttendance(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Half Day', 'Half Day'),
        ('WFH', 'WFH'),
    ]

    staff = models.ForeignKey(Staff, on_delete=models.CASCADE)
    date = models.DateField()
    in_time = models.TimeField(null=True, blank=True)
    out_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Present')
    branch = models.CharField(max_length=100)

    class Meta:
        unique_together = ('staff', 'date')

    def __str__(self):
        return f"{self.staff.name} - {self.date} - {self.status}"

    @property
    def hours_worked(self):
        duration = _attendance_duration(self.in_time, self.out_time)
        if duration is None:
            return None
        return round(duration.total_seconds() / 3600.0, 2)

    def save(self, *args, **kwargs):

    # ✅ If WFH → skip all auto logic
        if self.status == 'WFH':
            self.in_time = None
            self.out_time = None
            super().save(*args, **kwargs)
            return

        auto_status = _auto_attendance_status(self.in_time, self.out_time)

        if auto_status:
            self.status = auto_status
        else:
            self.status = 'Absent'

        super().save(*args, **kwargs)

# ------------------------
# Student Attendance

class StudentAttendance(models.Model):
    STATUS_CHOICES = [
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Half Day', 'Half Day'),
        ('Leave', 'Leave'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    date = models.DateField()
    in_time = models.TimeField(null=True, blank=True)
    out_time = models.TimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Present')
    branch = models.CharField(max_length=100)
    batch = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        unique_together = ('student', 'date')

    def __str__(self):
        return f"{self.student.name} - {self.date} - {self.status}"

    @property
    def hours_worked(self):
        duration = _attendance_duration(self.in_time, self.out_time)
        if duration is None:
            return None
        return round(duration.total_seconds() / 3600.0, 2)

    def save(self, *args, **kwargs):
        auto_status = _auto_attendance_status(self.in_time, self.out_time)

        if auto_status and self.status != 'Leave':
            self.status = auto_status
        elif self.status != 'Leave' and not auto_status:
            self.status = 'Absent'

        super().save(*args, **kwargs)
