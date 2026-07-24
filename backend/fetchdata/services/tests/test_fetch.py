from unittest.mock import patch

from django.test import TestCase

from core.models import Category, City, SourceRecord
from fetchdata.services.fetch import fetch_overpass_api, get_overpass_query
from fetchdata.services.tests.factories import OverpassResultElementFactory
from fetchdata.services.utils import category_tags


class FetchOverpassAPIPipelineTestCase(TestCase):
    def setUp(self):
        self.results = OverpassResultElementFactory.build_batch(10)
        self.source = SourceRecord.objects.create(name="Overpass", source_type=SourceRecord.API)

    def test_get_overpass_query(self):
        city = City.objects.create(name="London")

        cafe = Category.objects.create(name="Cafe")
        gym = Category.objects.create(name="Gym")
        restaurant = Category.objects.create(name="Restaurant")
        park = Category.objects.create(name="Park")

        categories = [cafe, gym, restaurant, park]

        query = get_overpass_query(categories=categories, city=city)

        self.assertIn("[out:json]", query)
        self.assertIn("out center", query)
        self.assertIn(f'area["name"="{city.name}"]', query)
        self.assertIn(f'area["name:en"="{city.name}"]', query)

        self.assertIn(f'node["{category_tags[cafe.name]["tag"]}"="{category_tags[cafe.name]["value"]}"](area.city);', query)
        self.assertIn(f'way["{category_tags[cafe.name]["tag"]}"="{category_tags[cafe.name]["value"]}"](area.city);', query)
        self.assertIn(f'relation["{category_tags[cafe.name]["tag"]}"="{category_tags[cafe.name]["value"]}"](area.city);', query)

        self.assertIn(f'node["{category_tags[gym.name]["tag"]}"="{category_tags[gym.name]["value"]}"](area.city);', query)
        self.assertIn(f'node["{category_tags[restaurant.name]["tag"]}"="{category_tags[restaurant.name]["value"]}"](area.city);', query)
        self.assertIn(f'node["{category_tags[park.name]["tag"]}"="{category_tags[park.name]["value"]}"](area.city);', query)

        school = Category.objects.create(name="School")
        bank = Category.objects.create(name="Bank")

        self.assertNotIn(f'node["{category_tags[school.name]["tag"]}"="{category_tags[school.name]["value"]}"](area.city);', query)
        self.assertNotIn(f'node["{category_tags[bank.name]["tag"]}"="{category_tags[bank.name]["value"]}"](area.city);', query)

    @patch("fetchdata.services.fetch.api")
    def test_fetch_overpass_api(self, mock_api):
        mock_api.query.return_value.nodes = self.results
        mock_api.query.return_value.ways = []
        mock_api.query.return_value.relations = []

        results, source = fetch_overpass_api("test_query")

        self.assertEqual(results, self.results)
        self.assertEqual(len(SourceRecord.objects.all()), 1)
        self.assertEqual(source, self.source)

    