from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from overpy.exception import OverPyException

from core.models import Category, City, Place, SourceRecord
from fetchdata.services.tests.factories import (
    OverpyNodeFactory,
    OverpyRelationFactory,
    OverpyWayFactory,
)


class ImportPlaceViewTestCase(TestCase):
    def setUp(self):
        self.url = "import_places"
        self.source = SourceRecord.objects.create(name="Overpass", source_type=SourceRecord.API)
        self.city = City.objects.create(name="London")
        self.category = Category.objects.create(name="Cafe")

        self.user = get_user_model().objects.create_superuser(username="Admin", password="testpassword1234!")
        self.client.force_login(self.user)

    @patch("fetchdata.services.fetch.api.query")
    def test_valid_form(self, mock_query):
        nodes = OverpyNodeFactory.build_batch(10)
        ways = OverpyWayFactory.build_batch(10)
        relations = OverpyRelationFactory.build_batch(10)

        mock_query.return_value.nodes = nodes
        mock_query.return_value.ways = ways
        mock_query.return_value.relations = relations

        self.assertEqual(Place.objects.count(), 0)

        response = self.client.post(reverse(f"admin:{self.url}"), data={
            "sourcerecord": self.source.id,
            "city": self.city.id,
            "category": self.category.id,
        })


        self.assertEqual(response.status_code, 302)
        self.assertEqual(Place.objects.count(), len(nodes + ways + relations))

    @patch("fetchdata.services.fetch.api.query")
    def test_invalid_form(self, mock_query):
        nodes = OverpyNodeFactory.build_batch(10)
        ways = OverpyWayFactory.build_batch(10)
        relations = OverpyRelationFactory.build_batch(10)

        mock_query.return_value.nodes = nodes
        mock_query.return_value.ways = ways
        mock_query.return_value.relations = relations

        self.assertEqual(Place.objects.count(), 0)

        response = self.client.post(reverse(f"admin:{self.url}"), data={
            "sourcerecord": "Invalid",
            "city": "Invalid",
            "category": "Invalid",
        })

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.context["form"].is_valid())
        self.assertEqual(Place.objects.count(), 0)

    @patch("fetchdata.services.fetch.api.query")
    def test_form_overpy_error(self, mock_query):
        mock_query.side_effect = OverPyException()

        response = self.client.post(reverse(f"admin:{self.url}"), data={
            "sourcerecord": self.source.id,
            "city": self.city.id,
            "category": self.category.id,
        })

        self.assertFalse(response.context["form"].is_valid())
        self.assertFormError(response.context["form"], None, "Overpy raised an exception!")

    @patch("fetchdata.services.fetch.api.query")
    def test_form_error(self, mock_query):
        mock_query.side_effect = Exception()

        response = self.client.post(reverse(f"admin:{self.url}"), data={
            "sourcerecord": self.source.id,
            "city": self.city.id,
            "category": self.category.id,
        })

        self.assertFalse(response.context["form"].is_valid())
        self.assertFormError(response.context["form"], None, "Something went wrong!")
