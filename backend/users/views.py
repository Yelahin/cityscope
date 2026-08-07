from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.views import LoginView
from django.http import HttpResponseRedirect
from django.urls import reverse, reverse_lazy
from django.views.generic import CreateView

from .forms import RegistrationForm

# Create your views here.


class SignUpView(CreateView):
    form_class = RegistrationForm
    template_name = "users/sign_up.html"
    success_url = reverse_lazy("health")

    def form_valid(self, form):
        form.save()
        user = authenticate(
            username=form.cleaned_data["username"],
            password=form.cleaned_data["password1"],
        )
        login(self.request, user)
        return HttpResponseRedirect(self.success_url)


class CustomLoginView(LoginView):
    template_name = "users/login.html"
    next_page = reverse_lazy("health")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("health"))
