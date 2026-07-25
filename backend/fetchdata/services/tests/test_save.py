from django.test import TestCase

from core.models import City, Place, SourceRecord
from fetchdata.services.save import save_places_to_db
from fetchdata.services.tests.factories import (
    OverpyNodeFactory,
    OverpyRelationFactory,
    OverpyWayFactory,
)
from fetchdata.services.transform import get_transformed_data


class SaveOverpassAPIPipeline(TestCase):
    def setUp(self):
        self.source = SourceRecord.objects.create(name="Overpass", source_type=SourceRecord.API)
        self.city = City.objects.create(name="London")

    def test_save_places_to_db_one(self):
        node = OverpyNodeFactory(tags__name="Test Place node")

        transformed_data = get_transformed_data(([node], self.source), self.city)

        save_places_to_db(transformed_data)

        self.assertEqual(Place.objects.count(), 1)
        self.assertTrue(Place.objects.filter(name="Test Place node").exists())
        self.assertEqual(Place.objects.first().city, self.city)
        self.assertEqual(Place.objects.first().sourcerecord, self.source)

    def test_save_places_to_db_multiple(self):
        elements = OverpyNodeFactory.build_batch(10) + OverpyWayFactory.build_batch(10) + OverpyRelationFactory.build_batch(10)

        transformed_data = get_transformed_data((elements, self.source), self.city)

        save_places_to_db(transformed_data)

        self.assertEqual(Place.objects.count(), len(elements))
        self.assertEqual(Place.objects.filter(city=self.city).count(), len(elements))
        self.assertEqual(Place.objects.filter(sourcerecord=self.source).count(), len(elements))

    def test_save_places_to_db_empty(self):
        save_places_to_db([])

        self.assertEqual(Place.objects.count(), 0)
