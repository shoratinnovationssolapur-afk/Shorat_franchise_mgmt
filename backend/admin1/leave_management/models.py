from django.db import models
from admin1.add_franchise.models import AddFranchise
from admin1.add_staff.models import Staff


class StaffLeaveRequest(models.Model):
    APPLICANT_TYPE_CHOICES = [
        ("Staff", "Staff"),
        ("Franchise", "Franchise"),
    ]

    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Approved", "Approved"),
        ("Rejected", "Rejected"),
        ("Withdrawn", "Withdrawn"),
    ]

    LEAVE_TYPE_CHOICES = [
        ("Casual", "Casual"),
        ("Sick", "Sick"),
        ("Emergency", "Emergency"),
        ("Other", "Other"),
    ]

    staff = models.ForeignKey(
        Staff,
        on_delete=models.CASCADE,
        related_name="leave_requests",
        null=True,
        blank=True,
    )
    franchise = models.ForeignKey(
        AddFranchise,
        on_delete=models.CASCADE,
        related_name="staff_leave_requests",
    )
    applicant_type = models.CharField(
        max_length=20,
        choices=APPLICANT_TYPE_CHOICES,
        default="Staff",
    )
    leave_type = models.CharField(max_length=20, choices=LEAVE_TYPE_CHOICES, default="Casual")
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    reviewer_note = models.TextField(blank=True, default="")
    franchise_approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        applicant = self.staff.name if self.staff else self.franchise.name
        return f"{applicant} - {self.start_date} to {self.end_date} - {self.status}"

    @property
    def total_days(self):
        return (self.end_date - self.start_date).days + 1
