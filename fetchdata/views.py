from django.views.generic.edit import FormView
from .forms import ImportPlacesForm
from django.contrib import admin
from django.template.response import TemplateResponse
from django.contrib import admin
from django.urls import reverse_lazy


# Create your views here.

class ImportPlacesView(FormView):
    admin = None

    template_name = "admin/import_places.html"
    form_class = ImportPlacesForm
    success_url = reverse_lazy("admin:import_places")

    # Add additional context to the page
    def get_context_data(self, **kwargs):
        context = {
            "title": "Import Places",
            "page_name": "Import Places",
            "category_name": "Custom Pages",
            **super().get_context_data(**kwargs),
            **admin.site.each_context(self.request),
        }
        return context

def custom_pages_index(request):
    # Get list of apps from django site
    app_list = admin.site.get_app_list(request)

    context = {
        "title": "Custom Pages administration",
        "app_list": [app for app in app_list if app["app_label"] == "custom_pages"] # select only custom pages apps
        }
    return TemplateResponse(request, "admin/app_index.html", context=context)
