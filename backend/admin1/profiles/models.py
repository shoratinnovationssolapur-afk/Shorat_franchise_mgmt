from django.db import models
from django.conf import settings  # ✅ correct import

class Profile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,  # ✅ dynamic reference to your custom user model
        on_delete=models.CASCADE,
        related_name="profile"
    )
    role = models.CharField(max_length=50, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.user.username}'s profile"
