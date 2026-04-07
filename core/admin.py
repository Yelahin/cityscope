from django.contrib import admin
from .models import City, Category, SourceRecord, Place

# Register your models here.

admin.site.register(City)
admin.site.register(Category)
admin.site.register(SourceRecord)

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'city', 'latitude', 'longitude', 'sourcerecord']
