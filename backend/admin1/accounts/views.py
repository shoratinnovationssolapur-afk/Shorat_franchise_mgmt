from django.contrib.auth.hashers import check_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import time
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from admin1.add_franchise.models import AddFranchise
from admin1.add_staff.models import Staff

User = get_user_model()


def get_user_display_name(user):
    if user.role == "staff":
        try:
            return Staff.objects.get(user=user).name
        except Staff.DoesNotExist:
            pass

    if user.role == "franchise_head":
        try:
            return AddFranchise.objects.get(user=user).name
        except AddFranchise.DoesNotExist:
            pass

    return user.get_full_name() or user.username or user.email


def get_user_branch_payload(user):
    if not user.branch_id:
        return None

    return {
        "id": user.branch_id,
        "name": getattr(user.branch, "name", str(user.branch)),
    }


@csrf_exempt
def login_view(request):
    if request.method == "POST":
        started_at = time.perf_counter()
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")
            role = data.get("role")
        except Exception:
            return JsonResponse({"success": False, "error": "Invalid request body"}, status=400)

        user = User.objects.select_related("branch").filter(email__iexact=email).first()
        if user is None or not check_password(password, user.password):
            response = JsonResponse({"success": False, "error": "Invalid credentials"}, status=401)
            response["X-Login-Time-Ms"] = str(round((time.perf_counter() - started_at) * 1000))
            return response

        # ✅ Ensure role matches
        if user.role != role:
            response = JsonResponse({"success": False, "error": "Role mismatch"}, status=403)
            response["X-Login-Time-Ms"] = str(round((time.perf_counter() - started_at) * 1000))
            return response

        # ✅ Generate JWT access token
        access_token = str(AccessToken.for_user(user))

        # ✅ Role-based redirect mapping
        role_redirects = {
            "admin": "/admin/dashboard",
            "franchise_head": "/franchise/dashboard",
            "staff": "/staff/dashboard",
        }

        display_name = get_user_display_name(user)

        response = JsonResponse({
            "success": True,
            "message": f"Welcome {display_name}!",
            "name": display_name,
            "role": user.role,
            "branch": get_user_branch_payload(user),
            "email": user.email,
            "redirect_url": role_redirects.get(user.role, "/login"),
            "access": access_token,   # 👈 JWT access token
        })
        response["X-Login-Time-Ms"] = str(round((time.perf_counter() - started_at) * 1000))
        return response

    return JsonResponse({"success": False, "error": "Invalid request method"}, status=405)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    current_password = request.data.get("current_password")
    new_password = request.data.get("new_password")

    if not user.check_password(current_password):
        return Response(
            {"error": "Current password is incorrect"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save()
    return Response(
        {"message": "Password updated successfully"},
        status=status.HTTP_200_OK,
    )
