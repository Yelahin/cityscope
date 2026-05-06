import factory
from core.models import Place, Category, City, SourceRecord
from random import randrange

class CategoryFactory(factory.django.DjangoModelFactory): 
    class Meta: 
        model = Category
        django_get_or_create = ("name", )

    name = factory.Faker(
        'random_element',
        elements=["Cafe", "Gym", "Hospital", "School", "Restaurant"]
    )


class CityFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = City
        django_get_or_create = ("name", )

    name = factory.Faker(
        'random_element',
        elements=["Paris", "London", "Berlin", "Rome"]
    )


class SourceRecordFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = SourceRecord
        django_get_or_create = ("name", )

    name = "Overpass"
    source_type = SourceRecord.API


class PlaceFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Place

    name = factory.Sequence(lambda n: f'Place {n}')
    address = None
    latitude = factory.LazyFunction(lambda: randrange(-90, 91))
    longitude = factory.LazyFunction(lambda: randrange(-180, 181))
    category = factory.SubFactory(CategoryFactory)
    city = factory.SubFactory(CityFactory)
    sourcerecord = factory.SubFactory(SourceRecordFactory)
    rating = None
    price_level = None
    opening_status = None
