from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("leave_management", "0003_staffleaverequest_franchise_approved_at"),
    ]

    operations = [
        migrations.AlterField(
            model_name="staffleaverequest",
            name="status",
            field=models.CharField(
                choices=[
                    ("Pending", "Pending"),
                    ("Approved", "Approved"),
                    ("Rejected", "Rejected"),
                    ("Withdrawn", "Withdrawn"),
                ],
                default="Pending",
                max_length=20,
            ),
        ),
    ]
