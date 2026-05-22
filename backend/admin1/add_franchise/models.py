# # add_staff/models.py
# from django.db import models
# from admin1.add_franchise.models import AddFranchise  # import franchise model

# class Staff(models.Model):
#     STATUS_CHOICES = [
#         ('Active', 'Active'),
#         ('Inactive', 'Inactive'),
#     ]

#     name = models.CharField(max_length=100)
#     role = models.CharField(max_length=50)
#     franchise = models.ForeignKey(
#         AddFranchise,
#         on_delete=models.CASCADE,
#         related_name='staff'
#     )
#     phone = models.CharField(max_length=15)
#     salary = models.DecimalField(max_digits=10, decimal_places=2)
#     status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='Active')

#     def __str__(self):
#         return f"{self.name} ({self.role})"

# from django.db import models
# from django.contrib.auth import get_user_model

# User = get_user_model()

# class AddFranchise(models.Model):
#     user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="franchise", null=True, blank=True)
#     name = models.CharField(max_length=100)
#     location = models.CharField(max_length=100)
#     start_date = models.DateField()
#     status = models.CharField(max_length=20, choices=[("active", "Active"), ("inactive", "Inactive")])
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return self.name

# models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import pre_delete
from django.dispatch import receiver

User = get_user_model()

class AddFranchise(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="franchise", null=True, blank=True)
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100, blank=True, null=True)
    office_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    office_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    office_radius_meters = models.PositiveIntegerField(default=100)
    start_date = models.DateField()
    status = models.CharField(max_length=20, choices=[("active", "Active"), ("inactive", "Inactive")])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

