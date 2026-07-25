from random import choice

import factory
import overpy
from faker import Faker

from fetchdata.services.utils import category_tags

fake = Faker()

class OverpassTagsFactory(factory.DictFactory):
    name = factory.Sequence(lambda n: f'Place {n}')

    @classmethod
    def _generate_tags(cls, kwargs):
        kwargs.setdefault("addr:street", fake.street_name())
        kwargs.setdefault("addr:housenumber", fake.building_number())
        kwargs.setdefault("addr:postcode", fake.postcode())

        random_category = choice(list(category_tags.values()))
        kwargs[random_category["tag"]] = random_category["value"]

        return kwargs

    @classmethod
    def _create(cls, models_class, *args, **kwargs):
        kwargs = cls._generate_tags(kwargs)
        return super()._create(models_class, *args, **kwargs)

    @classmethod
    def _build(cls, models_class, *args, **kwargs):
        kwargs = cls._generate_tags(kwargs)
        return super()._build(models_class, *args, **kwargs)


class OverpyNodeFactory(factory.Factory):
    class Meta:
        model = overpy.Node

    node_id = factory.Sequence(lambda n: n)
    lat = factory.LazyFunction(lambda: float(fake.latitude()))
    lon = factory.LazyFunction(lambda: float(fake.longitude()))
    tags = factory.SubFactory(OverpassTagsFactory)
    attributes = factory.LazyFunction(dict)


class OverpyWayFactory(factory.Factory):
    class Meta:
        model = overpy.Way

    way_id = factory.Sequence(lambda n: n)
    node_ids = factory.LazyFunction(lambda: [1, 2, 3])
    tags = factory.SubFactory(OverpassTagsFactory)
    center_lat = factory.LazyFunction(lambda: float(fake.latitude()))
    center_lon = factory.LazyFunction(lambda: float(fake.longitude()))
    attributes = factory.LazyFunction(dict)


class OverpyRelationFactory(factory.Factory):
    class Meta:
        model = overpy.Relation

    rel_id = factory.Sequence(lambda n: n)
    members = factory.LazyFunction(lambda: [])
    tags = factory.SubFactory(OverpassTagsFactory)
    center_lat = factory.LazyFunction(lambda: float(fake.latitude()))
    center_lon = factory.LazyFunction(lambda: float(fake.longitude()))
    attributes = factory.LazyFunction(dict)