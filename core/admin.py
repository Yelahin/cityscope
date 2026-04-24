from django.contrib import admin
from django.urls import path
from fetchdata.views import ImportPlacesView, custom_pages_index
from .models import Category, City, Place, SourceRecord
from .utils import RatingListFilter


# Create custom admin site
class CustomSite(admin.AdminSite):
    site_header = "Cityscope administration"
    site_title = "Cityscope site admin"

    # Add new application 'Custom Pages' to application list
    def get_app_list(self, request, app_label=None):
        app_list = super().get_app_list(request, app_label)

        if app_label is None:
            app_list.append({
                "name": "Custom Pages",
                "app_label": "custom_pages",
                "app_url": "/admin/custom_pages/",
                "has_module_perms": True,
                "models": [
                    {
                        "name": "Import Places",
                        "admin_url": "/admin/custom_pages/import_places/"
                    },
                ]
            })

        return app_list

    # Add custom pages to django admin
    def get_urls(self):
        custom_urls = [
            path(
                'custom_pages/import_places/', 
                self.admin_view(ImportPlacesView.as_view(admin=self)),
                name="import_places"
            ),
            path(
                'custom_pages/',
                self.admin_view(custom_pages_index),
                name="custom_pages"
            ),
        ]

        return custom_urls + super().get_urls()
    

admin.site.__class__ = CustomSite


# Register your models here.


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    list_display_links = ["name", "slug"]
    readonly_fields = ["slug"]
    fields = ["name", "slug"]
    search_fields = ["name", "slug"]
    ordering = ["name"]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    list_display_links = ["name", "slug"]
    readonly_fields = ["slug"]
    fields = ["name", "slug"]
    search_fields = ["name", "slug"]
    ordering = ["name"]


@admin.register(SourceRecord)
class SourceRecordAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "source_type",
    ]
    list_display_links = ["name", "source_type"]
    search_fields = ["name", "source_type"]
    list_filter = ["source_type"]
    ordering = ["name", "source_type"]


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    show_facets = admin.ShowFacets.NEVER
    list_display = [
        "name",
        "category",
        "city",
        "latitude",
        "longitude",
        "sourcerecord",
        "opening_status",
    ]
    readonly_fields = ["slug"]
    fields = [
        "name",
        "slug",
        "address",
        "latitude",
        "longitude",
        "category",
        "sourcerecord",
        "city",
        "rating",
        "price_level",
        "opening_status",
    ]
    search_fields = [
        "name",
        "address",
        "category__name",
        "sourcerecord__name",
        "city__name",
        "opening_status",
    ]
    list_filter = [
        "category",
        "sourcerecord",
        RatingListFilter,
        "city",
    ]
    ordering = [
        "name",
        "latitude",
        "longitude",
        "category__name",
        "sourcerecord",
        "city__name",
        "opening_status",
    ]
