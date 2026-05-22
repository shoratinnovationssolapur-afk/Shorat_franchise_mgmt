import threading
from django.conf import settings
from django.core.mail import send_mail
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import AddFranchise
from django.core.validators import EmailValidator


User = get_user_model()

def send_welcome_email(email, franchise_name, password):
    try:
        send_mail(
            subject="Franchise Management System Login",
            message=(
                f"Hello {franchise_name},\n\n"
                f"Your password for Franchise Management System is: {password}\n\n"
                f"Please change your password after first login."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        print("Failed to send email:", e)

# class FranchiseSerializer(serializers.ModelSerializer):
#     # For create/update (optional on update)
#     # email = serializers.EmailField(write_only=True, required=False, allow_blank=False)
#     validators=[EmailValidator()]
#     password = serializers.CharField(write_only=True, required=False, allow_blank=False)
#     # Read-only user info for edit prefill

#     user_id = serializers.IntegerField(source="user.id", read_only=True)
#     user_email = serializers.EmailField(source="user.email", read_only=True)

#     class Meta:
#         model = AddFranchise
#         fields = [
#             "id",
#             "name",
#             "location",
#             "start_date",
#             "status",
#             # write-only inputs
#             "email",
#             "password",
#             # read-only user info
#             "user_id",
#             "user_email",
#         ]

#     def create(self, validated_data):
#         email = validated_data.pop("email")
#         name = validated_data.pop("name")
#         password = validated_data.pop("password")

#         if User.objects.filter(email=email).exists():
#             raise serializers.ValidationError({"email": "This email is already registered."})

#         # ⚡ Make sure your User model has 'role' or remove this
#         user = User.objects.create_user(
#             username=name,
#             email=email,
#             password=password,
#             role='franchise_head'  # fallback if no role field
#         )

#         franchise = AddFranchise.objects.create(
#             user=user,
#             name=name,
#             **validated_data
#         )

#         # Send email in background
#         threading.Thread(
#             target=send_welcome_email,
#             args=(email, name, password)
#         ).start()

#         return franchise

#     def update(self, instance, validated_data):
#         # Update franchise fields
#         instance.name = validated_data.get("name", instance.name)
#         instance.location = validated_data.get("location", instance.location)
#         instance.start_date = validated_data.get("start_date", instance.start_date)
#         instance.status = validated_data.get("status", instance.status)

#         # Optionally update linked user email/password
#         email = validated_data.get("email", None)
#         password = validated_data.get("password", None)

#         user = instance.user
#         if user is not None:
#             if email is not None:
#                 # Allow unchanged email without raising unique error
#                 if email != user.email:
#                     if User.objects.filter(email=email).exclude(id=user.id).exists():
#                         raise serializers.ValidationError({"email": "This email is already registered."})
#                     user.email = email
#                     user.username = instance.name  # keep username aligned with franchise name
#             # If password provided, change it
#             if password:
#                 user.set_password(password)
#             user.save()

#         instance.save()
#         return instance
class FranchiseSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=False)

    user_id = serializers.IntegerField(source="user.id", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = AddFranchise
        fields = [
            "id",
            "name",
            "location",
            "office_latitude",
            "office_longitude",
            "office_radius_meters",
            "start_date",
            "status",
            "email",
            "password",
            "user_id",
            "user_email",
        ]

    def create(self, validated_data):
        email = validated_data.pop("email")
        password = validated_data.pop("password", settings.DEFAULT_USER_PASSWORD)
        name = validated_data.get("name")

        User = get_user_model()

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "Email already exists"})

        user = User.objects.create_user(
            username=name,
            email=email,
            password=password,
            role="franchise_head"
        )

        franchise = AddFranchise.objects.create(
            user=user,
            **validated_data
        )

        return franchise

    def update(self, instance, validated_data):
        email = validated_data.pop("email", None)
        password = validated_data.pop("password", None)

        instance.name = validated_data.get("name", instance.name)
        instance.location = validated_data.get("location", instance.location)
        instance.office_latitude = validated_data.get("office_latitude", instance.office_latitude)
        instance.office_longitude = validated_data.get("office_longitude", instance.office_longitude)
        instance.office_radius_meters = validated_data.get("office_radius_meters", instance.office_radius_meters)
        instance.start_date = validated_data.get("start_date", instance.start_date)
        instance.status = validated_data.get("status", instance.status)
        instance.save()

        if email:
            if User.objects.filter(email=email).exclude(id=instance.user_id).exists():
                raise serializers.ValidationError({"email": "Email already exists"})
            instance.user.email = email

        if password:
            instance.user.set_password(password)

        instance.user.save()

        return instance
