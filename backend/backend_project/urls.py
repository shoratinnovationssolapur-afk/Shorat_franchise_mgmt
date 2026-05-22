# backend_project/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse

# simple root health view
def root_health(request):
    return JsonResponse({"status": "ok", "message": "Django backend is live"})

# existing api health (keeps original behavior)
def api_health(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path("admin/", admin.site.urls),

    # root health (so visiting / won't return 404)
    path("", root_health),

    # Health endpoint under /api/
    path("api/health/", api_health),

    # JWT token endpoints
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # API Endpoints (keep the includes you already have)
    path("api/accounts/", include("admin1.accounts.urls")),
    path("api/franchise/", include("admin1.add_franchise.urls")),
    path("api/events/", include("admin1.add_event.urls")),
    path("api/profiles/", include("admin1.profiles.urls")),
    path("api/students/", include("Franchise.add_student.urls")),
    path("api/courses/", include("admin1.add_course.urls")),
    path("api/batches/", include("admin1.add_batch.urls")),
    path("api/staff/", include("admin1.add_staff.urls")),
    path("api/notifications/", include("admin1.notifications.urls")),
    path("api/attendance/", include("admin1.attendance.urls")),
    path("api/leave/", include("admin1.leave_management.urls")),
    path("api/inventory/", include("admin1.inventory.urls")),
]
