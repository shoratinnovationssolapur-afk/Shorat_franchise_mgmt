from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentViewSet

router = DefaultRouter()
router.register(r'', StudentViewSet, basename='students')  # empty string so /api/students/ works

urlpatterns = [
    path('', include(router.urls)),
]