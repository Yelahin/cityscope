from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .factories import PlaceFactory
from core.models import Place

class FavoritePlaceTests(APITestCase):
    def setUp(self):
        self.user_1_credentials = {"username": "User_1", "password": "password-user-1"}
        self.user_2_credentials = {"username": "User_2", "password": "password-user-2"}

        self.user_1 = get_user_model().objects.create_user(username=self.user_1_credentials["username"], password=self.user_1_credentials["password"])
        self.user_2 = get_user_model().objects.create_user(username=self.user_2_credentials["username"], password=self.user_2_credentials["password"])
        self.url = "/api/places/favorite/"

        self.place_count = 30
        self.favorite_places_count = self.place_count // 2

        for number in range(self.place_count):
            place = PlaceFactory()
            if number < self.favorite_places_count:
                self.user_1.favorite_places.add(place)
      
    def test_unauthenticated_user_cannot_access_endpoints(self):
        id = Place.objects.first().id

        # GET
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.get(f"/api/places/{id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # POST
        response = self.client.post(f"/api/places/{id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # DELETE 
        response = self.client.delete(f"/api/places/{id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_list_of_favorite_places(self):
        # Get list of favorite places (user_1)
        self.client.login(**self.user_1_credentials)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], self.favorite_places_count)
        self.assertContains(response, f"Place {Place.objects.order_by("-id").first().id - self.place_count}")
        self.assertNotContains(response, f"Place {Place.objects.order_by("-id").first().id - self.favorite_places_count}")


        # Get empty list of favoirte places (user_2)
        self.client.login(**self.user_2_credentials)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)
        self.assertEqual(response.data["results"], [])

    def test_get_detail_favorite_place(self):
        # Get existing favorite place
        self.client.login(**self.user_1_credentials)
        id = self.user_1.favorite_places.first().id
        response = self.client.get(f"/api/places/{id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, f"Place {id-1}")
        self.assertNotContains(response, f"Place {id}")

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
        id = self.user_1.favorite_places.first().id
        self.assertTrue(self.user_1.favorite_places.filter(id=id, name=f"Place {id-1}").exists())
        self.assertFalse(self.user_2.favorite_places.filter(id=id, name=f"Place {id-1}").exists())

        self.client.login(**self.user_1_credentials)
        response = self.client.get(f"/api/places/{id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, f"Place {id-1}")

        self.client.login(**self.user_2_credentials)
        response = self.client.get(f"/api/places/{id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_post_favorite_place(self):
        # Add favorite place
        self.client.login(**self.user_1_credentials)
        self.assertEqual(len(self.user_1.favorite_places.all()), self.favorite_places_count)
        self.assertFalse(self.user_1.favorite_places.filter(name=f"Place {Place.objects.order_by("-id").first().id -  self.favorite_places_count}").exists())
        response = self.client.post(f"/api/places/{Place.objects.order_by("-id").first().id - self.favorite_places_count+1}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(self.user_1.favorite_places.all()), self.favorite_places_count + 1)
        self.assertTrue(self.user_1.favorite_places.filter(name=f"Place {Place.objects.order_by("-id").first().id - self.favorite_places_count}").exists())

        # Add favorite place that already in favorite places
        id = Place.objects.order_by("-id").first().id - self.favorite_places_count
        self.assertTrue(self.user_1.favorite_places.filter(id=id))
        response = self.client.post(f"/api/places/{id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertTrue(self.user_1.favorite_places.filter(id=id))

        # Add not existing place to favorite places
        self.assertFalse(Place.objects.filter(id=Place.objects.order_by("-id").first().id + 1).exists())
        resposne = self.client.post("/api/places/1000/favorite/")
        self.assertEqual(resposne.status_code, 404)

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
        id = Place.objects.order_by("-id").first().id - self.favorite_places_count
        self.client.login(**self.user_1_credentials)
        self.assertTrue(self.user_1.favorite_places.filter(id=id).exists())
        response = self.client.delete(f"/api/places/{id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(self.user_1.favorite_places.filter(id=id).exists())

        # Delete place that no more exists in favorite places
        self.assertFalse(self.user_1.favorite_places.filter(id=id).exists())
        response = self.client.delete(f"/api/places/{id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(self.user_1.favorite_places.filter(id=id).exists())

        # Delete not existing place from favorite places
        id = Place.objects.order_by("-id").first().id + 1
        self.assertFalse(Place.objects.filter(id=id).exists())
        response = self.client.delete(f"/api/places/{id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_can_delete_only_own_favorte_places(self):
        # Add favorite place to user_2
        self.client.login(**self.user_2_credentials)
        id = Place.objects.order_by("-id").first().id - self.favorite_places_count
        response = self.client.post(f"/api/places/{id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(len(self.user_1.favorite_places.all()), self.favorite_places_count)
        self.assertEqual(len(self.user_2.favorite_places.all()), 1)

        # Delete favorite place from user_2
        response = self.client.delete(f"/api/places/{id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(self.user_1.favorite_places.all()), self.favorite_places_count)
        self.assertEqual(len(self.user_2.favorite_places.all()), 0)

        # Delete favorite places from user_1
        self.client.login(**self.user_1_credentials)
        response = self.client.delete(f"/api/places/{id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.delete(f"/api/places/{id-1}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        response = self.client.delete(f"/api/places/{id-2}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(len(self.user_1.favorite_places.all()), self.favorite_places_count-3)
        self.assertEqual(len(self.user_2.favorite_places.all()), 0)
        