from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    # fields you want to display in admin
    list_display = ("email", "username", "role", "branch", "is_staff", "is_active")
    list_filter = ("role", "branch", "is_staff", "is_active")
    search_fields = ("email", "username", "role", "branch")
    ordering = ("email",)

    # fieldsets = edit form layout
    fieldsets = (
        (None, {"fields": ("email", "password", "username", "role", "branch")}),
        ("Permissions", {"fields": ("is_staff", "is_active", "is_superuser", "groups", "user_permissions")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "role", "branch", "password1", "password2", "is_staff", "is_active"),
        }),
    )
