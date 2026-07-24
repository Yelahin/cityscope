from random import choice

import factory
from faker import Faker

from fetchdata.services.utils import category_tags

fake = Faker()

class OverpassTagsFactory(factory.DictFactory):
    name = factory.Sequence(lambda n: f'Place {n}')

    @classmethod
    def _create(cls, models_class, *args, **kwargs):
        kwargs.update({
            "addr:street": fake.street_name(),
            "addr:housenumber": fake.building_number(),
            "addr:postcode": fake.postcode(),
        })

        random_category = choice(list(category_tags.values()))
        kwargs[random_category["key"]] = random_category["value"]

        return super()._create(models_class, *args, **kwargs)

class OverpassResultElementFactory(factory.DictFactory):
    tags = factory.SubFactory(OverpassTagsFactory)
    lat = factory.LazyFunction(lambda: float(fake.latitude()))
    lon = factory.LazyFunction(lambda: float(fake.longitude()))
