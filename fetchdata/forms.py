from django import forms
from core.models import SourceRecord, City, Category, latitude_validator, longitude_validator
from django.core.validators import EMPTY_VALUES
from django.core.exceptions import ValidationError


class ImportPlacesForm(forms.Form):
    sourcerecord = forms.ModelChoiceField(queryset=SourceRecord.objects.all())
    category = forms.ModelChoiceField(queryset=Category.objects.all())
    city = forms.ModelChoiceField(queryset=City.objects.all(), required=False)
    latitude = forms.DecimalField(validators=latitude_validator, required=False)
    longitude = forms.DecimalField(validators=longitude_validator, required=False)

    def clean(self):
        city = self.cleaned_data.get("city")
        if city is None:
            latitude = self.cleaned_data.get("latitude")
            longitude = self.cleaned_data.get("longitude")
            error_message = "Empty value is invalid!"

            if latitude in EMPTY_VALUES and longitude in EMPTY_VALUES:
                self.add_error("latitude", ValidationError(error_message))
                self.add_error("longitude", ValidationError(error_message))
                self.add_error("city", ValidationError(error_message))

            elif latitude in EMPTY_VALUES:
                self.add_error("latitude", ValidationError(error_message))

            elif longitude in EMPTY_VALUES:
                self.add_error("longitude", ValidationError(error_message))
        return self.cleaned_data
