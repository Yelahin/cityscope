import factory
from users.models import SavedSearch


class SavedSearchFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SavedSearch

    name = factory.Sequence(lambda n: f"Saved search {n}")
    params = {
        "lat": 20,
        "lon": 12,
        "radius": 400,
        "city": 64,
        "category": 3,
        "ordering": "-name",
    }
