from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admin1.accounts'  # full Python path to the app
    label = 'accounts'         # this must match your AUTH_USER_MODEL


