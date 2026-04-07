from django.contrib import admin

from .models import Category, City, Place, SourceRecord
from .utils import RatingListFilter

# Register your models here.


@admin.register(City)
class CityAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    list_display_links = ["name", "slug"]
    search_fields = ["name", "slug"]
    ordering = ["name"]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "slug"]
    list_display_links = ["name", "slug"]
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
    list_display = [
        "name",
        "category",
        "city",
        "latitude",
        "longitude",
        "sourcerecord",
        "opening_status",
    ]
    search_fields = [
        "name",
        "address",
        "category__name",
        "sourcerecord__name",
        "city__name",
        "rating",
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
