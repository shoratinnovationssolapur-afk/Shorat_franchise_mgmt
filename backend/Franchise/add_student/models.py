from django.db import models
from admin1.add_franchise.models import AddFranchise
from admin1.add_batch.models import Batch

class Student(models.Model):
    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Inactive", "Inactive"),
    ]

    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)

    # Batch dropdown
    batches = models.ManyToManyField(Batch,  related_name="student_batches" )

    # Franchise auto-filled
    franchise = models.CharField(max_length=100, null=True, blank=True)

    total_fees = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    fees_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="Active")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.batch})"