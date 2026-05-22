from django.db import models
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import InventoryItem
from .serializers import InventoryItemSerializer


class InventoryItemViewSet(viewsets.ModelViewSet):
    serializer_class = InventoryItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = InventoryItem.objects.select_related("franchise").all()
        user = self.request.user
        franchise_id = self.request.query_params.get("franchise")
        low_stock = self.request.query_params.get("low_stock")

        if getattr(user, "role", None) == "franchise_head":
            queryset = queryset.filter(franchise__user=user)
        elif franchise_id:
            queryset = queryset.filter(franchise_id=franchise_id)

        if low_stock in {"1", "true", "True"}:
            queryset = queryset.filter(quantity__lte=models.F("reorder_level"))

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if getattr(user, "role", None) == "franchise_head":
            serializer.save(franchise=user.franchise)
        else:
            serializer.save()
