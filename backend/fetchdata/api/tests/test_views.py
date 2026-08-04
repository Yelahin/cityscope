from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.exceptions import ErrorDetail
from rest_framework.test import APITestCase

from core.models import Category, City, Place
from fetchdata.api.views import PlaceViewSet

from .factories import PlaceFactory


class PlaceDetailTests(APITestCase):
    def setUp(self):
        PlaceViewSet.throttle_classes = ()
        self.place = PlaceFactory(
            address="Alexanderplatz, Berlin",
            rating=4.5,
            price_level="10$ - 20$",
            opening_status=Place.OPEN,
        )
        self.url = f"/api/places/{self.place.id}/"

    def test_detail_includes_required_place_information(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], self.place.name)
        self.assertEqual(response.data["address"], self.place.address)
        self.assertEqual(response.data["category"]["name"], self.place.category.name)
        self.assertEqual(response.data["rating"], self.place.rating)
        self.assertEqual(response.data["price_level"], self.place.price_level)
        self.assertEqual(response.data["opening_status"], self.place.opening_status)
        self.assertIn("latitude", response.data)
        self.assertIn("longitude", response.data)
        self.assertFalse(response.data["is_favorite"])

    def test_detail_marks_authenticated_users_favorite(self):
        user = get_user_model().objects.create_user(
            username="User_1", password="password-user-1"
        )
        user.favorite_places.add(self.place)
        self.client.login(username="User_1", password="password-user-1")

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["is_favorite"])


class PlaceTestCase(APITestCase):
    def setUp(self):
        PlaceViewSet.throttle_classes = ()
        self.url = "places"
        self.place = PlaceFactory(name="Test Obj", address="Elm Court 5 02138")
        self.place_count = 50
        PlaceFactory.create_batch(self.place_count)

    def test_place_pagination(self):
        page_size = 5
        page_count = -(-(self.place_count + 6) // page_size)

        PlaceFactory(name="1")
        PlaceFactory(name="1")
        PlaceFactory(name="1")
        PlaceFactory(name="1")
        PlaceFactory(name="1")

        response = self.client.get(reverse("place-list") + f"?page_size={page_size}&ordering=name")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["results"][0]["name"], "1")
        self.assertEqual(response.data["results"][1]["name"], "1")
        self.assertEqual(response.data["results"][2]["name"], "1")
        self.assertEqual(response.data["results"][3]["name"], "1")
        self.assertEqual(response.data["results"][4]["name"], "1")

        response = self.client.get(reverse("place-list") + f"?page_size={page_size}&ordering=name&page=2")
        self.assertEqual(response.status_code, 200)
        self.assertNotEqual(response.data["results"][0]["name"], "1")

        for page in range(1, page_count+1):
            response = self.client.get(reverse("place-list") + f"?page_size={page_size}&page={page}")
            self.assertEqual(response.status_code, 200)
            if page != page_count:
                self.assertNotEqual(response.data["next"], None)
            else:
                self.assertEqual(response.data["next"], None)

    def test_place_filter_name(self):
        # Test exact match
        PlaceFactory(name=self.place.name[:-2])
        PlaceFactory(name=self.place.name[3])
        place1 = PlaceFactory(name="Test Place")
        self.assertEqual(Place.objects.count(), self.place_count + 4)

        response = self.client.get(reverse("place-list") + f"?name={self.place.name}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], Place.objects.filter(name=self.place.name).count())
        self.assertEqual(response.data["results"][0]["name"], self.place.name)

        response = self.client.get(reverse("place-list") + f"?name={place1.name}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], place1.name)

        response = self.client.get(reverse("place-list") + f"?name={self.place.name[:-3]}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 0)

    def test_place_filter_address(self):
        # Test exact match
        place1 = PlaceFactory(address="Maple Street 42 90210")

        self.assertEqual(Place.objects.count(), self.place_count + 2)

        response = self.client.get(reverse("place-list") + f"?address={self.place.address}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["address"], self.place.address)

        response = self.client.get(reverse("place-list") + f"?address={place1.address}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["address"], place1.address)

        response = self.client.get(reverse("place-list") + f"?address={place1.address[:-3]}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 0)

    def test_place_filter_search_name_exact_match(self):
        PlaceFactory(name=self.place.name[:-3])
        self.assertEqual(Place.objects.count(), self.place_count + 2)

        response = self.client.get(reverse("place-list") + f"?search={self.place.name}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], Place.objects.filter(name=self.place.name).count())
        self.assertEqual(response.data["results"][0]["name"], self.place.name)

    def test_place_filter_search_name_contains(self):
        self.assertEqual(Place.objects.count(), self.place_count + 1)

        response = self.client.get(reverse("place-list") + f"?search={self.place.name[:-3]}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], Place.objects.filter(name__icontains=self.place.name[:-3]).count())
        self.assertEqual(response.data["results"][0]["name"], self.place.name)

        self.assertEqual(Place.objects.filter(name__icontains="Place").count(), self.place_count)
        response = self.client.get(reverse("place-list") + "?search=Place")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], Place.objects.filter(name__icontains="Place").count())

        PlaceFactory(name="ObjectToTest 1")
        PlaceFactory(name="ObjectToTest 2")
        PlaceFactory(name="ObjectToTest 3")

        self.assertEqual(Place.objects.count(), self.place_count + 4)
        response = self.client.get(reverse("place-list") + "?search=ObjectToTest")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 3)

    def test_place_filter_search_address_exact_match(self):
        PlaceFactory(name=self.place.address[:-3])
        self.assertEqual(Place.objects.count(), self.place_count + 2)

        response = self.client.get(reverse("place-list") + f"?search={self.place.address}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], Place.objects.filter(address=self.place.address).count())
        self.assertEqual(response.data["results"][0]["address"], self.place.address)

    def test_place_filter_search_address_contains(self):
        test_place = PlaceFactory(address="Unique Test-Address")
        PlaceFactory(address="Test Address 1")
        PlaceFactory(address="Test Address 2")
        PlaceFactory(address="Test Address 3")
        self.assertEqual(Place.objects.count(), self.place_count + 5)

        response = self.client.get(reverse("place-list") + f"?search={test_place.address}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["address"], test_place.address)

        self.assertEqual(Place.objects.filter(address__icontains="Test Address").count(), 3)
        response = self.client.get(reverse("place-list") + "?search=Test Address")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], Place.objects.filter(address__icontains="Test Address").count())

    def test_place_filter_city(self):
        city = City.objects.get(name="London")
        places_count = Place.objects.filter(city__id=city.id).count()
        response = self.client.get(reverse("place-list") + f"?city={city.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], Place.objects.filter(city__id=city.id).count())
        self.assertEqual(response.data["results"][0]["city"], {"id": city.id, "name": city.name})

        PlaceFactory(city=city)
        PlaceFactory(city=city)
        PlaceFactory(city=city)

        response = self.client.get(reverse("place-list") + f"?city={city.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], places_count + 3)

    def test_place_filter_category_exact(self):
        category = Category.objects.get(name="Cafe")
        places_count = Place.objects.filter(category__id=category.id).count()
        response = self.client.get(reverse("place-list") + f"?category={category.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], Place.objects.filter(category__id=category.id).count())
        self.assertEqual(response.data["results"][0]["category"], {"id": category.id, "name": category.name})

        PlaceFactory(category=category)
        PlaceFactory(category=category)
        PlaceFactory(category=category)

        response = self.client.get(reverse("place-list") + f"?category={category.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], places_count + 3)

    def test_place_filter_category_contains(self):
        category = Category.objects.get(name="Cafe")

        new_category = Category.objects.create(name="Police Station")

        PlaceFactory(category=new_category)
        PlaceFactory(category=new_category)
        PlaceFactory(category=new_category)

        response = self.client.get(reverse("place-list") + f"?category={category.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], Place.objects.filter(category__id=category.id).count())

        response = self.client.get(reverse("place-list") + f"?category={category.id},{new_category.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], Place.objects.filter(category__id=category.id).count() + 3)
        self.assertEqual(response.data["count"], Place.objects.filter(category__in=[category.id, new_category.id]).count())

    def test_place_filter_rating_exact(self):
        self.assertEqual(Place.objects.filter(rating=1.9).count(), 0)
        PlaceFactory(rating=1.9)
        PlaceFactory(rating=2.9)
        PlaceFactory(rating=2.9)

        response = self.client.get(reverse("place-list") + "?rating=1.9")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], Place.objects.filter(rating=1.9).count())
        self.assertEqual(response.data["results"][0]["rating"], 1.9)

        response = self.client.get(reverse("place-list") + "?rating=2.9")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], Place.objects.filter(rating=2.9).count())
        self.assertEqual(response.data["results"][0]["rating"], 2.9)

    def test_place_filter_rating_range(self):
        self.assertEqual(Place.objects.filter(rating__gte=3, rating__lte=4).count(), 0)

        PlaceFactory(rating=3.1)
        PlaceFactory(rating=3.2)
        PlaceFactory(rating=3.3)
        PlaceFactory(rating=3.4)
        PlaceFactory(rating=3.5)
        PlaceFactory(rating=5)

        self.assertEqual(Place.objects.filter(rating__gte=3, rating__lte=4).count(), 5)

        response = self.client.get(reverse("place-list") + "?rating_min=3&rating_max=4")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], Place.objects.filter(rating__gte=3, rating__lte=4).count())

        response = self.client.get(reverse("place-list") + "?rating_min=4&rating_max=5")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], Place.objects.filter(rating__gte=4, rating__lte=5).count())

    def test_place_filter_price_level_exact(self):
        PlaceFactory(price_level="10$ - 25$")
        PlaceFactory(price_level="15$ - 35$")
        PlaceFactory(price_level="15$ - 35$")

        response = self.client.get(reverse("place-list") + "?price_level=10$ - 25$")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["price_level"], "10$ - 25$")

        response = self.client.get(reverse("place-list") + "?price_level=15$ - 35$")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)

    def test_place_filter_price_level_contains(self):
        PlaceFactory(price_level="10$ - 25$")
        PlaceFactory(price_level="15$ - 35$")
        PlaceFactory(price_level="15$ - 35$")

        PlaceFactory(price_level="50$ - 65$")
        PlaceFactory(price_level="45$ - 60$")

        response = self.client.get(reverse("place-list") + "?price_level=10$ - 25$,15$ - 35$")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 3)

    def test_place_filter_opening_status(self):
        PlaceFactory(opening_status="OPEN")
        PlaceFactory(opening_status="OPEN")
        PlaceFactory(opening_status="OPEN")

        PlaceFactory(opening_status="CLOSED")
        PlaceFactory(opening_status="CLOSED")

        response = self.client.get(reverse("place-list") + "?opening_status=OPEN")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 3)
        self.assertEqual(response.data["results"][0]["opening_status"], "OPEN")

        response = self.client.get(reverse("place-list") + "?opening_status=CLOSED")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(response.data["results"][0]["opening_status"], "CLOSED")

    def test_place_filter_radius(self):
        lat = 48.8566
        lon = 2.3522

        # In radius of 10km
        PlaceFactory(latitude=48.9016, longitude=2.3522)
        PlaceFactory(latitude=48.8566, longitude=2.4200)
        PlaceFactory(latitude=48.8120, longitude=2.2840)

        # In radius of 50km 
        PlaceFactory(latitude=49.1400, longitude=2.2522)
        PlaceFactory(latitude=48.5066, longitude=2.6022)

        # In radius of 100km
        PlaceFactory(latitude=49.6650, longitude=2.3522)

        # In radius of 10km
        response = self.client.get(reverse("place-list") + f"?lat={lat}&lon={lon}&radius=10")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 3)

        # In radius of 50km
        response = self.client.get(reverse("place-list") + f"?lat={lat}&lon={lon}&radius=50")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 5)

        # In radius of 100km
        response = self.client.get(reverse("place-list") + f"?lat={lat}&lon={lon}&radius=100")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 6)

    def test_place_display_distance_with_users_coordinates(self):
        response = self.client.get(reverse("place-list") + "?lat=48.8566&lon=2.3522")
        self.assertEqual(response.status_code, 200)
        self.assertTrue("distance" in response.data["results"][0])

        PlaceFactory(name="Distance Test", latitude=49.0682, longitude=2.3522)

        # 23.53 is correct distance between (48.8566, 2.3522) and (49.0682, 2.3522) coordinates
        # Test checking whether Haversine formula calculates the right value
        response = self.client.get(reverse("place-list") + "?name=Distance Test&lat=48.8566&lon=2.3522")
        self.assertEqual(response.data["results"][0]["distance"], 23.53)

    def test_place_dont_display_distance_without_users_coordinates(self):
        response = self.client.get(reverse("place-list"))
        self.assertEqual(response.status_code, 200)
        self.assertFalse("distance" in response.data["results"][0])

    def test_place_city_invalid_params(self):
        response =  self.client.get(reverse("place-list") + "?city=invalid_param")
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data["city"][0], ErrorDetail)

    def test_place_category_invalid_params(self):
        response =  self.client.get(reverse("place-list") + "?category=invalid_param")
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data["category"][0], ErrorDetail)

        response =  self.client.get(reverse("place-list") + "?category=invalid_param,another_invalid_param")
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data["category"][0], ErrorDetail)

    def test_place_rating_invalid_params(self):
        response =  self.client.get(reverse("place-list") + "?rating=invalid_param")
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data["rating"][0], ErrorDetail)

    def test_place_rating_min_invalid_params(self):
        response =  self.client.get(reverse("place-list") + "?rating_min=invalid_param")
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data["rating_min"][0], ErrorDetail)

    def test_place_rating_max_invalid_params(self):
        response =  self.client.get(reverse("place-list") + "?rating_max=invalid_param")
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data["rating_max"][0], ErrorDetail)

    def test_place_opening_status_invalid_params(self):
        response =  self.client.get(reverse("place-list") + "?opening_status=invalid_param")
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data["opening_status"][0], ErrorDetail)

    def test_place_radius_invalid_params(self):
        response =  self.client.get(reverse("place-list") + "?radius=invalid_param&lat=2&lon=3")
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data["radius"][0], ErrorDetail)    

    def test_place_radius_not_provided_user_coordinates(self):
        response =  self.client.get(reverse("place-list") + "?radius=100")
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data["radius"][0], ErrorDetail)

    def test_place_radius_can_not_be_negative(self):
        response =  self.client.get(reverse("place-list") + "?radius=-100&lat=-90&lon=180")
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data["radius"][0], ErrorDetail)

    def test_place_lat_invalid_params(self):
        response =  self.client.get(reverse("place-list") + "?lat=invalid_param")
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data["lat"][0], ErrorDetail)

    def test_place_lon_invalid_params(self):
        response =  self.client.get(reverse("place-list") + "?lon=invalid_param")
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data["lon"][0], ErrorDetail)

    def test_place_lat_less_than_negative_90(self):
        response =  self.client.get(reverse("place-list") + "?lat=-91&lon=-180")
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data["lat"][0], ErrorDetail)

    def test_place_lat_greater_than_90(self):
        response =  self.client.get(reverse("place-list") + "?lat=91&lon=180")
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data["lat"][0], ErrorDetail)

    def test_place_lon_less_than_negative_180(self):
        response =  self.client.get(reverse("place-list") + "?lat=-90&lon=-181")
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data["lon"][0], ErrorDetail)

    def test_place_lon_greater_than_180(self):
        response =  self.client.get(reverse("place-list") + "?lat=90&lon=181")
        self.assertEqual(response.status_code, 400)
        self.assertIsInstance(response.data["lon"][0], ErrorDetail)
