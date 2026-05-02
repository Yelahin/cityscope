import overpy
from django.contrib import admin
from django.template.response import TemplateResponse
from django.urls import reverse_lazy
from django.views.generic.edit import FormView

from .forms import ImportPlacesForm
from .services.fetch import get_overpass_query, upload_data_to_database

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

    def form_valid(self, form):
        source = form.cleaned_data["sourcerecord"].name
        city = form.cleaned_data["city"]
        category = form.cleaned_data["category"]

        # Overpass API source
        if source == "Overpass":
            query = get_overpass_query(category=category, city=city)
            try:
                upload_data_to_database(query=query, city=city)

            # Exceptions
            except overpy.exception.OverPyException:
                form.add_error(None, "Overpy raised an exception!")
                return self.form_invalid(form)
            except Exception:
                form.add_error(None, "Something went wrong!")
                return self.form_invalid(form)

            return super().form_valid(form)


def custom_pages_index(request):
    # Get list of apps from django site
    app_list = admin.site.get_app_list(request)

    context = {
        "title": "Custom Pages administration",
        # select only custom pages apps
        "app_list": [
            app for app in app_list if app["app_label"] == "custom_pages"
        ],
    }
    return TemplateResponse(request, "admin/app_index.html", context=context)
