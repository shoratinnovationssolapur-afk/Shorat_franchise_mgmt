from django.apps import AppConfig

class AddBatchConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admin1.add_batch'  # <--- THIS MUST MATCH THE Python path
