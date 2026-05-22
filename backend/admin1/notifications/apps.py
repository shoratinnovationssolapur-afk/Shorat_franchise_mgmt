from django.apps import AppConfig

class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admin1.notifications'

    def ready(self):
        import admin1.notifications.signals  # This ensures signals are registered
