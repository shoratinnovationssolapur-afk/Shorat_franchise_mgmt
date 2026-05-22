from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import InventoryItemViewSet


router = DefaultRouter()
router.register(r"items", InventoryItemViewSet, basename="inventory-items")

urlpatterns = [
    path("", include(router.urls)),
]
