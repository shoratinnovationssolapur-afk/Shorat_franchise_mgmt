from django.apps import AppConfig


class AddFranchiseConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "admin1.add_franchise"



    def ready(self):
        import admin1.add_franchise.signals  # 👈 this ensures signals are registered
