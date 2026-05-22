# admin1/add_batch/models.py
from django.db import models

class Batch(models.Model):
    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Inactive", "Inactive"),
    ]

    name = models.CharField(max_length=100)
    franchise = models.CharField(max_length=100)  # store franchise name directly
    students = models.PositiveIntegerField(default=0)
    start = models.DateField()
    end = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="Active")


    def __str__(self):
        return f"{self.name} ({self.franchise})"