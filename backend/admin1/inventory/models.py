from django.db import models


class InventoryItem(models.Model):
    name = models.CharField(max_length=150)
    sku = models.CharField(max_length=80, blank=True, default="")
    category = models.CharField(max_length=100, blank=True, default="")
    franchise = models.ForeignKey(
        "add_franchise.AddFranchise",
        on_delete=models.CASCADE,
        related_name="inventory_items",
    )
    quantity = models.PositiveIntegerField(default=0)
    unit = models.CharField(max_length=30, default="pcs")
    reorder_level = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} - {self.franchise.name}"

    @property
    def is_low_stock(self):
        return self.quantity <= self.reorder_level
