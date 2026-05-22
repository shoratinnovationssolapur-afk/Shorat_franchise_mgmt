from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BatchViewSet

router = DefaultRouter()
router.register(r'', BatchViewSet, basename='batch')  # root of this app

urlpatterns = [
    path('', include(router.urls)),
]



