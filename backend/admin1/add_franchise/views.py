from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import transaction
from django.apps import apps
from rest_framework import viewsets, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import AddFranchise
from .serializers import FranchiseSerializer
from admin1.add_batch.models import Batch
from admin1.add_staff.models import Staff
from Franchise.add_student.models import Student
from admin1.notifications.models import Notification

import re
import smtplib

User = get_user_model()


# -------------------- Password validation --------------------
def validate_password(password):
    """
    Password rules:
    - No spaces
    - If letters exist, the first one must be uppercase
    - Numbers allowed freely
    """
    if " " in password:
        return False
    letters = re.findall(r"[A-Za-z]", password)
    if letters:
        return letters[0].isupper()
    return True  # if only numbers, allowed


# -------------------- Franchise ViewSet --------------------
# class FranchiseViewSet(viewsets.ModelViewSet):
#     queryset = AddFranchise.objects.all().order_by('-created_at')
#     serializer_class = FranchiseSerializer
#     lookup_field = "id"

#     def perform_create(self, serializer):
#         email = self.request.data.get("email", "").strip()
#         password = self.request.data.get("password", "").strip() or "123456"

#         # ✅ 1. Email required
#         if not email:
#             raise serializers.ValidationError({"email": "Email is required."})

#         # ✅ 2. Email should not contain uppercase letters
#         if any(c.isupper() for c in email):
#             raise serializers.ValidationError({"email": "Email must be in lowercase only."})

#         # ✅ 3. Validate email format
#         try:
#             validate_email(email)
#         except ValidationError:
#             raise serializers.ValidationError({"email": "Enter a valid email address."})

#         # ✅ 4. Password validation
#         if not validate_password(password):
#             raise serializers.ValidationError({
#                 "password": "Invalid password. First letter must be uppercase if letters exist, and no spaces."
#             })

#         # ✅ 5. Email existence check (global real email verification)
#         try:
#             domain = email.split("@")[1]
#             smtp = smtplib.SMTP(f"smtp.{domain}", 587, timeout=5)
#             smtp.quit()
#         except Exception:
#             raise serializers.ValidationError({"email": "This email domain is invalid or unreachable."})

#         serializer.save()
# -------------------- Franchise ViewSet --------------------
class FranchiseViewSet(viewsets.ModelViewSet):
    queryset = AddFranchise.objects.all().order_by('-created_at')
    serializer_class = FranchiseSerializer
    lookup_field = "id"  # safer than "name"

    def perform_create(self, serializer):
        email = self.request.data.get("email", "").strip()
        password = self.request.data.get("password", "").strip() or settings.DEFAULT_USER_PASSWORD

        # ✅ 1. Email required
        if not email:
            raise serializers.ValidationError({"email": "Email is required."})

        # ✅ 2. Email should be lowercase
        if any(c.isupper() for c in email):
            raise serializers.ValidationError({"email": "Email must be in lowercase only."})

        # ✅ 3. Validate email format
        try:
            validate_email(email)
        except ValidationError:
            raise serializers.ValidationError({"email": "Enter a valid email address."})

        # ✅ 4. Password validation
        if not validate_password(password):
            raise serializers.ValidationError({
                "password": "Invalid password. First letter must be uppercase if letters exist, and no spaces."
            })

        # ✅ 5. Skip SMTP domain check (Render blocks SMTP)
        # Previously you tried connecting to smtp.{domain}:587
        # We are skipping this for deployment

        serializer.save()


        

    # -------------------- Delete Franchise --------------------
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        try:
            with transaction.atomic():
                # Delete related students
                deleted_students = Student.objects.filter(franchise=instance).delete()
                print(f"Deleted {deleted_students[0]} students linked to franchise {instance.name}")

                # Delete related staff
                deleted_staff = instance.staff.all().delete()
                print(f"Deleted {deleted_staff[0]} staff linked to franchise {instance.name}")

                # Delete related batches
                deleted_batches = Batch.objects.filter(franchise=instance.name).delete()
                print(f"Deleted {deleted_batches[0]} batches linked to franchise {instance.name}")

                # Handle other FK references dynamically
                for model in apps.get_models():
                    for field in model._meta.get_fields():
                        if field.is_relation and field.related_model == AddFranchise:
                            if model.__name__ == "Notification":
                                continue
                            if field.auto_created and not field.concrete:
                                continue

                            qs = model.objects.filter(**{field.name: instance})
                            if qs.exists():
                                if field.null:
                                    updated_count = qs.update(**{field.name: None})
                                    print(f"Nullified {updated_count} {model.__name__}")
                                else:
                                    deleted_count, _ = qs.delete()
                                    print(f"Deleted {deleted_count} {model.__name__}")

                # Delete user
                if instance.user:
                    print(f"Deleting user account {instance.user.email}")
                    instance.user.delete()

                # Delete franchise
                instance.delete()
                print(f"Franchise {instance.name} deleted successfully")

        except Exception as e:
            print(f"Error deleting franchise: {e}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {"detail": "Franchise and related data deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )


# -------------------- Dashboard stats API --------------------
@api_view(['GET'])
def dashboard_stats(request):
    data = {
        "total_franchises": AddFranchise.objects.count(),
        "active_franchises": AddFranchise.objects.filter(status="active").count(),
        "inactive_franchises": AddFranchise.objects.filter(status="inactive").count(),
    }
    return Response(data)


# -------------------- Logged-in Franchise API --------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_franchise(request):
    user = request.user
    try:
        franchise = AddFranchise.objects.get(user=user)
        return Response({
            "name": franchise.name,
            "location": franchise.location,
            "status": franchise.status,
        })
    except AddFranchise.DoesNotExist:
        return Response({"error": "No franchise assigned"}, status=404)
