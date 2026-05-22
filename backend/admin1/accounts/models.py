from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('franchise_head', 'Franchise Head'),
        ('staff', 'Staff')
    )

    # use email as unique identifier
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="admin")

    # ✅ link branch to AddFranchise with cascade delete
    branch = models.ForeignKey(
        "add_franchise.AddFranchise",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="users"
    )

    USERNAME_FIELD = "email"   # login with email instead of username
    REQUIRED_FIELDS = ["username"]  # username still required internally

    def __str__(self):
        return f"{self.email} ({self.role})"
