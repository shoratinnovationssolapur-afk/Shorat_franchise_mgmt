# add_staff/models.py
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Staff(models.Model):
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE,null=True,blank=True)
    name = models.CharField(max_length=100, unique=True)
    role = models.CharField(max_length=50)
    franchise = models.ForeignKey(
        'add_franchise.AddFranchise',
        on_delete=models.CASCADE,
        related_name='staff'
    )
    phone = models.CharField(max_length=15)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Active')

    def __str__(self):
        return f"{self.name} ({self.role})"
