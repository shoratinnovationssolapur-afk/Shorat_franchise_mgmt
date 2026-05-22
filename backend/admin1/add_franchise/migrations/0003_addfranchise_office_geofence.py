from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("add_franchise", "0002_alter_addfranchise_location"),
    ]

    operations = [
        migrations.AddField(
            model_name="addfranchise",
            name="office_latitude",
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name="addfranchise",
            name="office_longitude",
            field=models.DecimalField(blank=True, decimal_places=6, max_digits=9, null=True),
        ),
        migrations.AddField(
            model_name="addfranchise",
            name="office_radius_meters",
            field=models.PositiveIntegerField(default=100),
        ),
    ]
