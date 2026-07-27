from django.test import TestCase

from core.models import Category, City, SourceRecord
from fetchdata.services.tests.factories import (
    OverpyNodeFactory,
    OverpyRelationFactory,
    OverpyWayFactory,
)
from fetchdata.services.transform import (
    get_address_from_element,
    get_category_from_element,
    get_latitude_from_element,
    get_longitude_from_element,
    get_name_from_element,
    get_opening_status_from_element,
    get_price_level_from_element,
    get_rating_from_element,
    get_transformed_data,
    transform_element,
)
from fetchdata.services.utils import category_tags


class TransformOverpassAPIPipeline(TestCase):
    def setUp(self):
        self.nodes = OverpyNodeFactory.build_batch(10)
        self.source = SourceRecord.objects.create(name="Overpass", source_type=SourceRecord.API)
        self.city = City.objects.create(name="London")

    def test_get_name_from_element_valid_name(self):
        element = OverpyNodeFactory(tags__name="TestCafe")
        result = get_name_from_element(element)

        self.assertEqual(result, element.tags["name"])

    def test_get_name_from_element_invalid_name(self):
        element = OverpyNodeFactory(tags__name="TestCafe 咖啡馆")
        result = get_name_from_element(element)

        self.assertEqual(result, "TestCafe ")

    def test_get_name_from_element_empty_name(self):
        element = OverpyNodeFactory(tags__name="咖啡馆")
        result = get_name_from_element(element)

        self.assertIsNone(result)

    def test_get_address_from_element_full_address(self):
        address = ["Test Street", "53", "12345"]
        element = OverpyNodeFactory(**{
            "tags__addr:street": address[0],
            "tags__addr:housenumber": address[1],
            "tags__addr:postcode": address[2],
        })

        result = get_address_from_element(element)

        self.assertEqual(result, " ".join(address))

    def test_get_address_from_element_half_complete_address(self):
        address = ["Test Street", "12345"]
        element = OverpyNodeFactory(**{
            "tags__addr:street": address[0],
            "tags__addr:housenumber": None,
            "tags__addr:postcode": address[1],
        })

        result = get_address_from_element(element)

        self.assertEqual(result, " ".join(address))

    def test_get_address_from_element_empty_address(self):
        element = OverpyNodeFactory(**{
            "tags__addr:street": None,
            "tags__addr:housenumber": None,
            "tags__addr:postcode": None,
        })

        result = get_address_from_element(element)

        self.assertIsNone(result)

    def test_get_category_from_element_existed_category(self):
        # Create all categories
        for cat_name in category_tags:
            Category.objects.create(name=cat_name)

        categories_amount = Category.objects.count()

        category = None
        element = OverpyNodeFactory.build()

        for key, value in category_tags.items():
            element_category = element.tags.get(value.get("tag"))
            if element_category is not None and element_category == value.get("value"):
                category = key
                break

        result = get_category_from_element(element)

        self.assertEqual(result.name, category)
        self.assertEqual(Category.objects.count(), categories_amount)

    def test_get_category_from_element_not_existed_category(self):
        # Delete all categories
        Category.objects.all().delete()
        self.assertEqual(Category.objects.count(), 0)

        category = None
        element = OverpyNodeFactory.build()

        for key, value in category_tags.items():
            element_category = element.tags.get(value.get("tag"))
            if element_category is not None and element_category == value.get("value"):
                category = key
                break

        result = get_category_from_element(element)

        self.assertEqual(result.name, category)
        self.assertEqual(Category.objects.count(), 1)

    def test_get_latitude_from_element_node_valid(self):
        element = OverpyNodeFactory(lat=95.34)

        result = get_latitude_from_element(element)

        self.assertEqual(result, 95.34)

    def test_get_latitude_from_element_node_invalid(self):
        element = OverpyNodeFactory.build()
        del element.lat

        self.assertFalse(hasattr(element, "lat"))

        result = get_latitude_from_element(element)

        self.assertIsNone(result)

    def test_get_latitude_from_element_way_valid(self):
        element = OverpyWayFactory(center_lat=95.34)

        result = get_latitude_from_element(element)

        self.assertEqual(result, 95.34)

    def test_get_latitude_from_element_way_invalid(self):
        element = OverpyWayFactory.build()
        del element.center_lat

        self.assertFalse(hasattr(element, "center_lat"))

        result = get_latitude_from_element(element)

        self.assertIsNone(result)

    def test_get_longitude_from_element_node_valid(self):
        element = OverpyNodeFactory(lon=95.34)

        result = get_longitude_from_element(element)

        self.assertEqual(result, 95.34)

    def test_get_longitude_from_element_node_invalid(self):
        element = OverpyNodeFactory.build()
        del element.lon

        self.assertFalse(hasattr(element, "lon"))

        result = get_longitude_from_element(element)

        self.assertIsNone(result)

    def test_get_longitude_from_element_way_valid(self):
        element = OverpyWayFactory(center_lon=95.34)

        result = get_longitude_from_element(element)

        self.assertEqual(result, 95.34)

    def test_get_longitude_from_element_way_invalid(self):
        element = OverpyWayFactory.build()
        del element.center_lon

        self.assertFalse(hasattr(element, "center_lon"))

        result = get_longitude_from_element(element)

        self.assertIsNone(result)

    def test_transform_element_node(self):
        node = self.nodes[0]

        result = transform_element(node, self.source, self.city)

        self.assertEqual(result, {
            "name": get_name_from_element(node),
            "address": get_address_from_element(node),
            "latitude": get_latitude_from_element(node),
            "longitude": get_longitude_from_element(node),
            "sourcerecord": self.source,
            "category": get_category_from_element(node),
            "city": self.city,
            "rating": get_rating_from_element(node),
            "price_level": get_price_level_from_element(node),
            "opening_status": get_opening_status_from_element(node),
        })

    def test_transform_element_way(self):
        way = OverpyWayFactory.build()

        result = transform_element(way, self.source, self.city)

        self.assertEqual(result, {
            "name": get_name_from_element(way),
            "address": get_address_from_element(way),
            "latitude": get_latitude_from_element(way),
            "longitude": get_longitude_from_element(way),
            "sourcerecord": self.source,
            "category": get_category_from_element(way),
            "city": self.city,
            "rating": get_rating_from_element(way),
            "price_level": get_price_level_from_element(way),
            "opening_status": get_opening_status_from_element(way),
        })

    def test_transform_element_relation(self):
        relation = OverpyRelationFactory.build()

        result = transform_element(relation, self.source, self.city)

        self.assertEqual(result, {
            "name": get_name_from_element(relation),
            "address": get_address_from_element(relation),
            "latitude": get_latitude_from_element(relation),
            "longitude": get_longitude_from_element(relation),
            "sourcerecord": self.source,
            "category": get_category_from_element(relation),
            "city": self.city,
            "rating": get_rating_from_element(relation),
            "price_level": get_price_level_from_element(relation),
            "opening_status": get_opening_status_from_element(relation),
        })

    def test_get_transformed_data_one(self):
        node = self.nodes[0]

        result = get_transformed_data(([node], self.source), self.city)

        self.assertEqual(result, [{
            "name": get_name_from_element(node),
            "address": get_address_from_element(node),
            "latitude": get_latitude_from_element(node),
            "longitude": get_longitude_from_element(node),
            "sourcerecord": self.source,
            "category": get_category_from_element(node),
            "city": self.city,
            "rating": get_rating_from_element(node),
            "price_level": get_price_level_from_element(node),
            "opening_status": get_opening_status_from_element(node),
        }])

    def test_get_transformed_data_multiple(self):
        elements = self.nodes + OverpyWayFactory.build_batch(5) + OverpyRelationFactory.build_batch(3)

        result = get_transformed_data((elements, self.source), self.city)

        self.assertEqual(len(result), len(elements))
        self.assertTrue(all(isinstance(element, dict) for element in result))
