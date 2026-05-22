import os
import django
from django.contrib.auth import get_user_model

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend_project.settings")
django.setup()

User = get_user_model()

EMAIL = os.getenv("DJANGO_SUPERUSER_EMAIL")
PASSWORD = os.getenv("DJANGO_SUPERUSER_PASSWORD")

if not EMAIL or not PASSWORD:
    raise RuntimeError(
        "Set DJANGO_SUPERUSER_EMAIL and DJANGO_SUPERUSER_PASSWORD in your environment."
    )

if not User.objects.filter(email=EMAIL).exists():
    User.objects.create_superuser(email=EMAIL, password=PASSWORD)
    print("Superuser created successfully!")
else:
    print("Superuser already exists.")
