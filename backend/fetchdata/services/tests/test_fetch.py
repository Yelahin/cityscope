from unittest.mock import patch

from django.test import TestCase
from overpy.exception import OverPyException

from core.models import Category, City, Place, SourceRecord
from fetchdata.services.fetch import (
    fetch_overpass_api,
    get_overpass_query,
    upload_data_to_database,
)
from fetchdata.services.tests.factories import (
    OverpyNodeFactory,
    OverpyRelationFactory,
    OverpyWayFactory,
)
from fetchdata.services.utils import category_tags


class FetchOverpassAPIPipelineTestCase(TestCase):
    def setUp(self):
        self.nodes = OverpyNodeFactory.build_batch(10)
        self.ways = OverpyWayFactory.build_batch(10)
        self.relations = OverpyRelationFactory.build_batch(10)
        self.source = SourceRecord.objects.create(name="Overpass", source_type=SourceRecord.API)
        self.city = City.objects.create(name="London")

    def test_get_overpass_query_contains_boilerplate(self):
        query = get_overpass_query(categories=[], city=self.city)

        self.assertIn("[out:json]", query)
        self.assertIn("out center", query)

    def test_get_overpass_query_contains_city_filters(self):
        query = get_overpass_query(categories=[], city=self.city)

        self.assertIn(f'area["name"="{self.city.name}"]', query)
        self.assertIn(f'area["name:en"="{self.city.name}"]', query)

    def test_get_overpass_query_includes_requested_categories(self):
        cafe = Category.objects.create(name="Cafe")

        query = get_overpass_query(categories=[cafe], city=self.city)

        tag, value = category_tags[cafe.name]["tag"], category_tags[cafe.name]["value"]
        self.assertIn(f'node["{tag}"="{value}"](area.city);', query)
        self.assertIn(f'way["{tag}"="{value}"](area.city);', query)
        self.assertIn(f'relation["{tag}"="{value}"](area.city);', query)

    def test_get_overpass_query_excludes_unrequested_categories(self):
        cafe = Category.objects.create(name="Cafe")
        school = Category.objects.create(name="School")

        query = get_overpass_query(categories=[cafe], city=self.city)

        tag, value = category_tags[school.name]["tag"], category_tags[school.name]["value"]
        self.assertNotIn(f'node["{tag}"="{value}"](area.city);', query)

    @patch("fetchdata.services.fetch.api.query")
    def test_fetch_overpass_api(self, mock_api):
        mock_api.return_value.nodes = self.nodes
        mock_api.return_value.ways = self.ways
        mock_api.return_value.relations = self.relations

        results, source = fetch_overpass_api("test_query")

        self.assertEqual(results, self.nodes + self.ways + self.relations)
        self.assertEqual(SourceRecord.objects.count(), 1)
        self.assertEqual(source, self.source)

    @patch("fetchdata.services.fetch.api.query")
    def test_upload_data_to_database(self, mock_api):
        mock_api.return_value.nodes = self.nodes
        mock_api.return_value.ways = self.ways
        mock_api.return_value.relations = self.relations

        self.assertEqual(Place.objects.count(), 0)

        category = Category.objects.create(name="Cafe")

        query = get_overpass_query(categories=[category], city=self.city)

        upload_data_to_database(query, self.city)

        self.assertEqual(Place.objects.count(), len(self.nodes + self.ways + self.relations))

    @patch("fetchdata.services.fetch.api.query")
    def test_upload_data_to_database_overpy_exception(self, mock_query):
        mock_query.side_effect = OverPyException()

        with self.assertLogs(logger="fetchdata.services.fetch", level="ERROR") as log, self.assertRaises(OverPyException):
            upload_data_to_database("query", self.city)

        self.assertIn("Overpy error occured!", log.output[0])

    @patch("fetchdata.services.fetch.api.query")
    def test_upload_data_to_database_exception(self, mock_query):
        mock_query.side_effect = Exception()

        with self.assertLogs(logger="fetchdata.services.fetch", level="ERROR") as log, self.assertRaises(Exception):
            upload_data_to_database("query", self.city)

        self.assertIn("Something went wrong!", log.output[0])
