from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("add_franchise", "0003_addfranchise_office_geofence"),
        ("add_staff", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="StaffLeaveRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("leave_type", models.CharField(choices=[("Casual", "Casual"), ("Sick", "Sick"), ("Emergency", "Emergency"), ("Other", "Other")], default="Casual", max_length=20)),
                ("start_date", models.DateField()),
                ("end_date", models.DateField()),
                ("reason", models.TextField()),
                ("status", models.CharField(choices=[("Pending", "Pending"), ("Approved", "Approved"), ("Rejected", "Rejected")], default="Pending", max_length=20)),
                ("reviewer_note", models.TextField(blank=True, default="")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("franchise", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="staff_leave_requests", to="add_franchise.addfranchise")),
                ("staff", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="leave_requests", to="add_staff.staff")),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
    ]
