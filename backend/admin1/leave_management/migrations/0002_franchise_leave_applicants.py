from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("leave_management", "0001_initial"),
        ("add_staff", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="staffleaverequest",
            name="staff",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="leave_requests",
                to="add_staff.staff",
            ),
        ),
        migrations.AddField(
            model_name="staffleaverequest",
            name="applicant_type",
            field=models.CharField(
                choices=[("Staff", "Staff"), ("Franchise", "Franchise")],
                default="Staff",
                max_length=20,
            ),
        ),
    ]
