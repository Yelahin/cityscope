from django import forms

from core.models import Category, City, SourceRecord


class ImportPlacesForm(forms.Form):
    sourcerecord = forms.ModelChoiceField(queryset=SourceRecord.objects.all())
    category = forms.ModelChoiceField(queryset=Category.objects.all())
    city = forms.ModelChoiceField(queryset=City.objects.all())
