from django.urls import path
from .views import login_view
from .views import change_password

urlpatterns = [
    path("login/", login_view, name="login"),

    path("change-password/", change_password, name="change-password"),

]

