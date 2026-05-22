import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend_project.settings")
django.setup()

User = get_user_model()

EMAIL = os.getenv("DJANGO_SUPERUSER_EMAIL")
PASSWORD = os.getenv("DJANGO_SUPERUSER_PASSWORD")
USERNAME = os.getenv("DJANGO_SUPERUSER_USERNAME", "admin")

if not EMAIL or not PASSWORD:
    raise RuntimeError(
        "Set DJANGO_SUPERUSER_EMAIL and DJANGO_SUPERUSER_PASSWORD in your environment."
    )

user, created = User.objects.get_or_create(
    email=EMAIL,
    defaults={
        "username": USERNAME,
        "role": "admin",
        "is_staff": True,
        "is_superuser": True,
        "is_active": True,
    },
)

if created:
    user.set_password(PASSWORD)
    user.save()
    print("Superuser created successfully!")
else:
    changed = False
    for field, value in {
        "role": "admin",
        "is_staff": True,
        "is_superuser": True,
        "is_active": True,
    }.items():
        if getattr(user, field) != value:
            setattr(user, field, value)
            changed = True

    if os.getenv("DJANGO_SUPERUSER_RESET_PASSWORD", "False").lower() == "true":
        user.set_password(PASSWORD)
        changed = True

    if changed:
        user.save()
        print("Superuser updated successfully!")
    else:
        print("Superuser already exists.")
