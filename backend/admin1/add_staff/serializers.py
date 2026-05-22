import threading
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Staff
from admin1.add_franchise.serializers import FranchiseSerializer
from django.core.mail import send_mail

User = get_user_model()

# Background email sender
def send_staff_welcome_email(email, staff_name, password):
    try:
        send_mail(
            subject="Franchise Management System Login",
            message=(
                f"Hello {staff_name},\n\n"
                f"Your login details for Franchise Management System:\n"
                f"Email: {email}\n"
                f"Password: {password}\n\n"
                f"Please change your password after first login."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        print("Failed to send staff email:", e)


class StaffSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email")  # gets email from related user
    role = serializers.CharField(required=False, default="Staff")
    franchise_name = serializers.CharField(source="franchise.name", read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Staff
        fields = [
            "id", "name", "role", "franchise", "franchise_name",
            "phone", "salary", "status", "email", "password"
        ]

    def validate_email(self, value):
        # Avoid duplicate emails
        user_qs = User.objects.filter(email=value)
        if self.instance and self.instance.user:
            user_qs = user_qs.exclude(pk=self.instance.user.pk)
        if user_qs.exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def create(self, validated_data):
        user_data = validated_data.pop("user")
        email = user_data.get("email")
        password = validated_data.pop("password", settings.DEFAULT_USER_PASSWORD)

        if not password:
            raise serializers.ValidationError({"password": "Password is required."})

        user = User.objects.create_user(username=email, email=email, password=password, role="staff")
        staff = Staff.objects.create(user=user, **validated_data)

        # Send welcome email in background
        threading.Thread(target=send_staff_welcome_email, args=(email, staff.name, password)).start()

        return staff

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        email = user_data.get("email", None)
        password = validated_data.pop("password", None)

        # Update linked user
        if instance.user:
            if email:
                instance.user.email = email
                instance.user.username = email
            if password:
                instance.user.set_password(password)
            instance.user.save()

        # Update staff fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance
