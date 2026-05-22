from django.contrib import admin

from .models import InventoryItem


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ("name", "sku", "franchise", "quantity", "unit", "reorder_level")
    list_filter = ("franchise", "category")
    search_fields = ("name", "sku", "category")
