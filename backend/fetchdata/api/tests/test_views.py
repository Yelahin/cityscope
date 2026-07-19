from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from core.models import Place

from .factories import PlaceFactory


class PlaceDetailTests(APITestCase):
    def setUp(self):
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


class FavoritePlaceTests(APITestCase):
    def setUp(self):
        self.user_1_credentials = {"username": "User_1", "password": "password-user-1"}
        self.user_2_credentials = {"username": "User_2", "password": "password-user-2"}

        self.user_1 = get_user_model().objects.create_user(username=self.user_1_credentials["username"], password=self.user_1_credentials["password"])
        self.user_2 = get_user_model().objects.create_user(username=self.user_2_credentials["username"], password=self.user_2_credentials["password"])
        self.url = "/api/places/favorite/"

        self.place_count = 20
        self.favorite_places_count = self.place_count // 2

        for number in range(self.place_count):
            place = PlaceFactory()
            if number < self.favorite_places_count:
                self.user_1.favorite_places.add(place)

        self.place = self.user_1.favorite_places.first()
      
    def test_unauthenticated_user_cannot_access_endpoints(self):
        # GET
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.get(f"/api/places/{self.place.id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # POST
        response = self.client.post(f"/api/places/{self.place.id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # DELETE 
        response = self.client.delete(f"/api/places/{self.place.id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_list_of_favorite_places(self):
        # Get list of favorite places (user_1)
        self.client.login(**self.user_1_credentials)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], self.favorite_places_count)

        # Get empty list of favorite places (user_2)
        self.client.login(**self.user_2_credentials)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)
        self.assertEqual(response.data["results"], [])

    def test_get_detail_favorite_place(self):
        # Get existing favorite place
        self.client.login(**self.user_1_credentials)
        response = self.client.get(f"/api/places/{self.place.id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, self.place.name)

        # Get not existing favorite place
        response = self.client.get(f"/api/places/{Place.objects.order_by("-id").first().id + 1}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_can_get_only_own_favorite_places(self):
        # GET list 
        self.assertEqual(len(self.user_1.favorite_places.all()), self.favorite_places_count)
        self.assertEqual(len(self.user_2.favorite_places.all()), 0)

        self.client.login(**self.user_1_credentials)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], self.favorite_places_count)

        self.client.login(**self.user_2_credentials)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

        # GET detail
        self.assertTrue(
            self.user_1.favorite_places.filter(
                id=self.place.id, name=self.place.name
            ).exists()
        )
        self.assertFalse(
            self.user_2.favorite_places.filter(
                id=self.place.id, name=self.place.name
            ).exists()
        )

        self.client.login(**self.user_1_credentials)
        response = self.client.get(f"/api/places/{self.place.id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, self.place.name)

        self.client.login(**self.user_2_credentials)
        response = self.client.get(f"/api/places/{self.place.id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_post_favorite_place(self):
        # Add favorite place
        place = Place.objects.exclude(
            id__in=self.user_1.favorite_places.values("id")
        ).first()
        self.client.login(**self.user_1_credentials)
        self.assertEqual(len(self.user_1.favorite_places.all()), self.favorite_places_count)
        self.assertFalse(self.user_1.favorite_places.filter(id=place.id).exists())
        response = self.client.post(f"/api/places/{place.id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(self.user_1.favorite_places.all()), self.favorite_places_count + 1)
        self.assertTrue(self.user_1.favorite_places.filter(id=place.id).exists())

        # Add favorite place that already in favorite places
        self.assertTrue(self.user_1.favorite_places.filter(id=self.place.id))
        response = self.client.post(f"/api/places/{self.place.id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertTrue(self.user_1.favorite_places.filter(id=self.place.id))

        # Add not existing place to favorite places
        self.assertFalse(Place.objects.filter(id=Place.objects.order_by("-id").first().id + 1).exists())
        response = self.client.post(f"/api/places/{Place.objects.order_by("-id").first().id + 1}/favorite/")
        self.assertEqual(response.status_code, 404)

    def test_user_can_add_only_own_favorite_places(self):
        self.assertEqual(len(self.user_1.favorite_places.all()), self.favorite_places_count)
        self.assertEqual(len(self.user_2.favorite_places.all()), 0)

        # Add favorite places for user_1
        self.client.login(**self.user_1_credentials)
        id = Place.objects.order_by("-id").first().id - self.favorite_places_count
        response = self.client.post(f"/api/places/{id+1}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.post(f"/api/places/{id+2}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.post(f"/api/places/{id+3}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(len(self.user_1.favorite_places.all()), self.favorite_places_count+3)
        self.assertEqual(len(self.user_2.favorite_places.all()), 0)

        # Add favorite places for user_2
        self.client.login(**self.user_2_credentials)
        id = Place.objects.order_by("-id").first().id - self.favorite_places_count
        response = self.client.post(f"/api/places/{id+1}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.post(f"/api/places/{id+2}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        response = self.client.post(f"/api/places/{id+3}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(len(self.user_1.favorite_places.all()), self.favorite_places_count+3)
        self.assertEqual(len(self.user_2.favorite_places.all()), 3)

    def test_delete_favorite_place(self):
        # Delete place from favorite places
        self.client.login(**self.user_1_credentials)
        self.assertTrue(self.user_1.favorite_places.filter(id=self.place.id).exists())
        response = self.client.delete(f"/api/places/{self.place.id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(self.user_1.favorite_places.filter(id=self.place.id).exists())

        # Delete place that no more exists in favorite places
        self.assertFalse(self.user_1.favorite_places.filter(id=self.place.id).exists())
        response = self.client.delete(f"/api/places/{self.place.id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(self.user_1.favorite_places.filter(id=self.place.id).exists())

        # Delete not existing place from favorite places
        id = Place.objects.order_by("-id").first().id + 1
        self.assertFalse(Place.objects.filter(id=id).exists())
        response = self.client.delete(f"/api/places/{id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_can_delete_only_own_favorite_places(self):
        # user_2 trying to delete user_1's favorite place
        self.assertEqual(len(self.user_1.favorite_places.all()), self.favorite_places_count)
        self.assertEqual(len(self.user_2.favorite_places.all()), 0)

        self.assertTrue(self.place in self.user_1.favorite_places.all())
        self.assertFalse(self.place in self.user_2.favorite_places.all())

        self.client.login(**self.user_2_credentials)
        response = self.client.delete(f"/api/places/{self.place.id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(len(self.user_1.favorite_places.all()), self.favorite_places_count)
