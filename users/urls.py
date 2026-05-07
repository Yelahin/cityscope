from django.urls import path
from .views import SignUpView, CustomLoginView, logout_view

urlpatterns = [
    path("logout/", logout_view),
    path("login/", CustomLoginView.as_view()),
    path("sign_up/", SignUpView.as_view()),
]