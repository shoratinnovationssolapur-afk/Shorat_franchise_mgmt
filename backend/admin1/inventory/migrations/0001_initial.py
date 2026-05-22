from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("add_franchise", "0003_addfranchise_office_geofence"),
    ]

    operations = [
        migrations.CreateModel(
            name="InventoryItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=150)),
                ("sku", models.CharField(blank=True, default="", max_length=80)),
                ("category", models.CharField(blank=True, default="", max_length=100)),
                ("quantity", models.PositiveIntegerField(default=0)),
                ("unit", models.CharField(default="pcs", max_length=30)),
                ("reorder_level", models.PositiveIntegerField(default=0)),
                ("notes", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "franchise",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="inventory_items",
                        to="add_franchise.addfranchise",
                    ),
                ),
            ],
            options={
                "ordering": ["name"],
            },
        ),
    ]
