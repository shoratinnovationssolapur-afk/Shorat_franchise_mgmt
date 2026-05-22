from rest_framework import serializers

from .models import InventoryItem


class InventoryItemSerializer(serializers.ModelSerializer):
    franchise_name = serializers.CharField(source="franchise.name", read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = InventoryItem
        fields = [
            "id",
            "name",
            "sku",
            "category",
            "franchise",
            "franchise_name",
            "quantity",
            "unit",
            "reorder_level",
            "is_low_stock",
            "notes",
            "created_at",
            "updated_at",
        ]
