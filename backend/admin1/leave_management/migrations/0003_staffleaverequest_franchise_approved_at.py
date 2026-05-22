from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("leave_management", "0002_franchise_leave_applicants"),
    ]

    operations = [
        migrations.AddField(
            model_name="staffleaverequest",
            name="franchise_approved_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
