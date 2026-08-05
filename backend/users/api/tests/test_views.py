import json
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from core.models import Place
from core.throttles import (
    LoginDayThrottle,
    LoginHourThrottle,
    LoginMinThrottle,
    PlaceDayThrottle,
    PlaceHourThrottle,
    PlaceMinThrottle,
    RegisterDayThrottle,
    RegisterHourThrottle,
    RegisterMinThrottle,
    SavedSearchDayThrottle,
    SavedSearchHourThrottle,
    SavedSearchMinThrottle,
)
from fetchdata.api.tests.factories import PlaceFactory
from fetchdata.api.views import PlaceViewSet
from users.api.views import (
    CustomTokenObtainPairView,
    RegisterUserView,
    SavedSearchViewSet,
)
from users.models import SavedSearch

from .factories import SavedSearchFactory


class RegisterUserTests(APITestCase):
    def setUp(self):
        cache.clear()
        RegisterUserView.throttle_classes = ()
        self.url = reverse("api_user_registration")

    def test_get_method_not_allowed(self):
        response = self.client.get(self.url)
        self.assertEqual(
            response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED
        )

    def test_register_with_valid_data(self):
        users_count = len(get_user_model().objects.all())
        self.assertEqual(users_count, 0)

        valid_data = {"username": "User_1", "password": "password-user-1"}
        response = self.client.post(self.url, valid_data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        users_count = len(get_user_model().objects.all())
        self.assertEqual(users_count, 1)
        self.assertTrue(
            get_user_model()
            .objects.filter(username=valid_data["username"])
            .exists()
        )

    def test_register_with_invalid_data(self):
        users_count = len(get_user_model().objects.all())
        self.assertEqual(users_count, 0)

        # Invalid username
        invalid_data = {"username": "(*@&^#%)", "password": "password-user-1"}
        response = self.client.post(self.url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        invalid_data = {"username": "User_#$%", "password": "password-user-1"}
        response = self.client.post(self.url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        users_count = len(get_user_model().objects.all())
        self.assertEqual(users_count, 0)

        # Invalid password
        invalid_data = {"username": "User_1", "password": "#"}
        response = self.client.post(self.url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        invalid_data = {"username": "User_1", "password": "user_1"}
        response = self.client.post(self.url, invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        users_count = len(get_user_model().objects.all())
        self.assertEqual(users_count, 0)

    @patch("core.throttles.RegisterMinThrottle.get_rate")
    def test_register_throttling_min(self, mock):
        mock.return_value = "3/min"
        RegisterUserView.throttle_classes = [RegisterMinThrottle]

        users_count = len(get_user_model().objects.all())
        self.assertEqual(users_count, 0)

        for index in range(0, 3):
            response = self.client.post(self.url, {"username": f"User_{index}", "password": f"user-password-{index}"})
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        users_count = len(get_user_model().objects.all())
        self.assertEqual(users_count, 3)

        response = self.client.post(self.url, {"username": "User_4", "password": "user-password-4"})
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data["detail"].code, "throttled")

        users_count = len(get_user_model().objects.all())
        self.assertEqual(users_count, 3)

    @patch("core.throttles.RegisterHourThrottle.get_rate")
    def test_register_throttling_hour(self, mock):
        mock.return_value = "5/hour"
        RegisterUserView.throttle_classes = [RegisterHourThrottle]

        users_count = len(get_user_model().objects.all())
        self.assertEqual(users_count, 0)

        for index in range(0, 5):
            response = self.client.post(self.url, {"username": f"User_{index}", "password": f"user-password-{index}"})
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        users_count = len(get_user_model().objects.all())
        self.assertEqual(users_count, 5)

        response = self.client.post(self.url, {"username": "User_4", "password": "user-password-4"})
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data["detail"].code, "throttled")

        users_count = len(get_user_model().objects.all())
        self.assertEqual(users_count, 5)

    @patch("core.throttles.RegisterDayThrottle.get_rate")
    def test_register_throttling_day(self, mock):
        mock.return_value = "10/day"
        RegisterUserView.throttle_classes = [RegisterDayThrottle]

        users_count = len(get_user_model().objects.all())
        self.assertEqual(users_count, 0)

        for index in range(0, 10):
            response = self.client.post(self.url, {"username": f"User_{index}", "password": f"user-password-{index}"})
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        users_count = len(get_user_model().objects.all())
        self.assertEqual(users_count, 10)

        response = self.client.post(self.url, {"username": "User_4", "password": "user-password-4"})
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data["detail"].code, "throttled")

        users_count = len(get_user_model().objects.all())
        self.assertEqual(users_count, 10)


class AuthenticationTests(APITestCase):
    def setUp(self):
        cache.clear()
        CustomTokenObtainPairView.throttle_classes = ()
        self.credentials = {
            "username": "User_1",
            "password": "password-user-1",
        }
        self.user = get_user_model().objects.create_user(**self.credentials)

    def test_current_user_requires_authentication(self):
        response = self.client.get(reverse("api_current_user"))

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_sets_httponly_cookie_and_cookie_authenticates(self):
        response = self.client.post(
            reverse("token_obtain_pair"), self.credentials, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn("access", response.data)
        self.assertNotIn("refresh", response.data)
        self.assertTrue(response.cookies["access_token"]["httponly"])

        response = self.client.get(reverse("api_current_user"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["username"], self.user.username)
        self.assertNotIn("password", response.data)

    def test_logout_clears_authentication_cookie(self):
        self.client.post(
            reverse("token_obtain_pair"), self.credentials, format="json"
        )

        response = self.client.post(reverse("api_user_logout"))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.cookies["access_token"]["max-age"], 0)

    def test_cookie_authenticated_mutations_require_csrf(self):
        client = APIClient(enforce_csrf_checks=True)
        client.post(reverse("token_obtain_pair"), self.credentials, format="json")
        saved_search = {"name": "Nearby cafes", "params": {"category": 1}}

        response = client.post(reverse("search-list"), saved_search, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        csrf_response = client.get(reverse("api_csrf_token"))
        response = client.post(
            reverse("search-list"),
            saved_search,
            format="json",
            HTTP_X_CSRFTOKEN=csrf_response.data["csrfToken"],
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    @patch("core.throttles.LoginMinThrottle.get_rate")
    def test_login_throttling_min(self, mock):
        mock.return_value = "3/min"
        CustomTokenObtainPairView.throttle_classes = [LoginMinThrottle]

        for _ in range(0, 3):
            response = self.client.post(reverse("token_obtain_pair"), self.credentials, format="json")
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.post(reverse("token_obtain_pair"), self.credentials, format="json")
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data["detail"].code, "throttled")

    @patch("core.throttles.LoginHourThrottle.get_rate")
    def test_login_throttling_hour(self, mock):
        mock.return_value = "5/hour"
        CustomTokenObtainPairView.throttle_classes = [LoginHourThrottle]

        for _ in range(0, 5):
            response = self.client.post(reverse("token_obtain_pair"), self.credentials, format="json")
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.post(reverse("token_obtain_pair"), self.credentials, format="json")
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data["detail"].code, "throttled")

    @patch("core.throttles.LoginDayThrottle.get_rate")
    def test_login_throttling_day(self, mock):
        mock.return_value = "10/day"
        CustomTokenObtainPairView.throttle_classes = [LoginDayThrottle]

        for _ in range(10):
            response = self.client.post(reverse("token_obtain_pair"), self.credentials, format="json")
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.post(reverse("token_obtain_pair"), self.credentials, format="json")
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data["detail"].code, "throttled")


class FavoritePlaceTests(APITestCase):
    def setUp(self):
        cache.clear()
        PlaceViewSet.throttle_classes = ()
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

    @patch("core.throttles.PlaceMinThrottle.get_rate")
    def test_favorite_throttling_min(self, mock):
        mock.return_value = "3/min"
        PlaceViewSet.throttle_classes = [PlaceMinThrottle]

        self.client.login(**self.user_1_credentials)
        self.assertEqual(self.user_1.favorite_places.count(), self.favorite_places_count)

        for place in self.user_1.favorite_places.all()[:3]:
            response = self.client.delete(f"/api/places/{place.id}/favorite/")
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(self.user_1.favorite_places.count(), self.favorite_places_count-3)
        place_id = self.user_1.favorite_places.first().id

        response = self.client.delete(f"/api/places/{place_id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data["detail"].code, "throttled")
        self.assertEqual(self.user_1.favorite_places.count(), self.favorite_places_count-3)

    @patch("core.throttles.PlaceHourThrottle.get_rate")
    def test_favorite_throttling_hour(self, mock):
        mock.return_value = "5/hour"
        PlaceViewSet.throttle_classes = [PlaceHourThrottle]

        self.client.login(**self.user_1_credentials)
        self.assertEqual(self.user_1.favorite_places.count(), self.favorite_places_count)

        for place in self.user_1.favorite_places.all()[:5]:
            response = self.client.delete(f"/api/places/{place.id}/favorite/")
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(self.user_1.favorite_places.count(), self.favorite_places_count-5)
        place_id = self.user_1.favorite_places.first().id

        response = self.client.delete(f"/api/places/{place_id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data["detail"].code, "throttled")
        self.assertEqual(self.user_1.favorite_places.count(), self.favorite_places_count-5)

    @patch("core.throttles.PlaceDayThrottle.get_rate")
    def test_favorite_throttling_day(self, mock):
        mock.return_value = "7/day"
        PlaceViewSet.throttle_classes = [PlaceDayThrottle]

        self.client.login(**self.user_1_credentials)
        self.assertEqual(self.user_1.favorite_places.count(), self.favorite_places_count)

        for place in self.user_1.favorite_places.all()[:7]:
            response = self.client.delete(f"/api/places/{place.id}/favorite/")
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(self.user_1.favorite_places.count(), self.favorite_places_count-7)
        place_id = self.user_1.favorite_places.first().id

        response = self.client.delete(f"/api/places/{place_id}/favorite/")
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data["detail"].code, "throttled")
        self.assertEqual(self.user_1.favorite_places.count(), self.favorite_places_count-7)


class SavedSearchTests(APITestCase):
    def setUp(self):
        cache.clear()
        SavedSearchViewSet.throttle_classes = ()
        self.user_1_credentials = {
            "username": "User_1",
            "password": "password-user-1",
        }
        self.user_2_credentials = {
            "username": "User_2",
            "password": "password-user-2",
        }

        self.user_1 = get_user_model().objects.create_user(
            username=self.user_1_credentials["username"],
            password=self.user_1_credentials["password"],
        )
        self.user_2 = get_user_model().objects.create_user(
            username=self.user_2_credentials["username"],
            password=self.user_2_credentials["password"],
        )

        self.url = "/api/searches/"
        self.saved_search_count = 10

        for _ in range(self.saved_search_count):
            SavedSearchFactory(user=self.user_1)

        self.search = SavedSearch.objects.filter(user=self.user_1).first()

    def test_unauthenticated_user_cannot_access_endpoints(self):
        data = {
            "name": "Saved search",
            "params": json.dumps({"category": 1, "ordering": "id"}),
        }

        # GET
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response = self.client.get(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # POST
        response = self.client.post(self.url, data=data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # PUT
        response = self.client.put(self.url + f"{self.search.id}/", data=data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # PATCH
        response = self.client.patch(
            self.url + f"{self.search.id}/", data={"params": data["params"]}
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # DELETE
        response = self.client.delete(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_of_saved_searches(self):
        # Get list of saved searches user_1
        self.client.login(**self.user_1_credentials)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], self.saved_search_count)
        self.assertIn("name", response.data["results"][0])
        self.assertIn("user", response.data["results"][0])
        self.assertIn("params", response.data["results"][0])

        # Get empty list of save searches user_2
        self.client.login(**self.user_2_credentials)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

    def test_get_detail_saved_search(self):
        # Get detail for existing search
        self.client.login(**self.user_1_credentials)
        response = self.client.get(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, self.search.name)

        # Get detail for not existing search
        response = self.client.get(
            self.url + f"{len(SavedSearch.objects.all()) + 1}/"
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_can_get_only_own_searches(self):
        # GET list
        self.assertEqual(
            len(SavedSearch.objects.filter(user=self.user_1)),
            self.saved_search_count,
        )
        self.assertEqual(len(SavedSearch.objects.filter(user=self.user_2)), 0)

        self.client.login(**self.user_1_credentials)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], self.saved_search_count)

        self.client.login(**self.user_2_credentials)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

        # GET detail
        self.assertTrue(
            SavedSearch.objects.filter(user=self.user_1, id=self.search.id)
        )
        self.assertFalse(
            SavedSearch.objects.filter(user=self.user_2, id=self.search.id)
        )

        self.client.login(**self.user_1_credentials)
        response = self.client.get(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, self.search.name)

        self.client.login(**self.user_2_credentials)
        response = self.client.get(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_create_saved_search(self):
        # Valid data
        valid_data = {
            "name": "Saved search",
            "params": json.dumps({"city": 1, "category": 3}),
        }

        self.client.login(**self.user_1_credentials)
        self.assertEqual(
            len(SavedSearch.objects.filter(user=self.user_1)),
            self.saved_search_count,
        )
        response = self.client.post(self.url, data=valid_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            len(SavedSearch.objects.filter(user=self.user_1)),
            self.saved_search_count + 1,
        )

        # Invalid Data
        invalid_data = {"name": "Saved search", "params": "invalid_data"}

        self.client.login(**self.user_1_credentials)
        self.assertEqual(
            len(SavedSearch.objects.filter(user=self.user_1)),
            self.saved_search_count + 1,
        )
        response = self.client.post(self.url, data=invalid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            len(SavedSearch.objects.filter(user=self.user_1)),
            self.saved_search_count + 1,
        )

    def test_user_can_create_only_own_searches(self):
        self.assertEqual(
            len(SavedSearch.objects.filter(user=self.user_1)),
            self.saved_search_count,
        )
        self.assertEqual(len(SavedSearch.objects.filter(user=self.user_2)), 0)

        user_1_data = {
            "name": "Saved search",
            "user": self.user_2,
            "params": json.dumps(
                {"city": 4, "category": 2, "ordering": "-latitude"}
            ),
        }

        user_2_data = {
            "name": "Saved search",
            "user": self.user_1,
            "params": json.dumps(
                {"city": 4, "category": 2, "ordering": "-latitude"}
            ),
        }

        # Add search for user_1
        self.client.login(**self.user_1_credentials)
        response = self.client.post(self.url, data=user_1_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(
            len(SavedSearch.objects.filter(user=self.user_1)),
            self.saved_search_count + 1,
        )
        self.assertEqual(len(SavedSearch.objects.filter(user=self.user_2)), 0)

        # Add search for user_2
        self.client.login(**self.user_2_credentials)
        response = self.client.post(self.url, data=user_2_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(
            len(SavedSearch.objects.filter(user=self.user_1)),
            self.saved_search_count + 1,
        )
        self.assertEqual(len(SavedSearch.objects.filter(user=self.user_2)), 1)

    def test_put_saved_search(self):
        # Valid data
        valid_data = {
            "name": "Modified search",
            "params": json.dumps({"category": 5}),
        }

        self.client.login(**self.user_1_credentials)
        response = self.client.get(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "Saved search")
        self.assertNotContains(response, "Modified search")

        response = self.client.put(
            self.url + f"{self.search.id}/", data=valid_data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.get(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "Modified search")
        self.assertNotContains(response, "Saved search")

        # Invalid data
        invalid_data = {"name": "Invalid search", "params": "invalid data"}

        self.client.login(**self.user_1_credentials)
        response = self.client.get(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "Modified search")
        self.assertNotContains(response, "Invalid search")

        response = self.client.put(
            self.url + f"{self.search.id}/", data=invalid_data
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.get(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "Modified search")
        self.assertNotContains(response, "Invalid search")

        # Modify not existing search
        self.client.login(**self.user_1_credentials)
        response = self.client.put(
            self.url + f"{len(SavedSearch.objects.all()) + 1}/",
            data=valid_data,
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_can_modify_only_own_search(self):
        # user_2 trying to modify user_1's saved search
        self.assertTrue(
            self.search in SavedSearch.objects.filter(user=self.user_1)
        )
        self.assertFalse(
            self.search in SavedSearch.objects.filter(user=self.user_2)
        )

        valid_data = {
            "name": "Modified search",
            "params": json.dumps({"category": 5, "ordering": "-name"}),
        }

        self.client.login(**self.user_2_credentials)
        response = self.client.put(
            self.url + f"{self.search.id}/", data=valid_data
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.client.login(**self.user_1_credentials)
        response = self.client.get(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotContains(response, "Modified search")
        self.assertContains(response, "Saved search")

    def test_patch_saved_search(self):
        # Valid data
        valid_data = {
            "name": "Patched search",
        }

        self.client.login(**self.user_1_credentials)
        response = self.client.get(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "Saved search")
        self.assertNotContains(response, "Patched search")

        response = self.client.patch(
            self.url + f"{self.search.id}/", data=valid_data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.get(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "Patched search")
        self.assertNotContains(response, "Saved search")

        # Invalid data
        invalid_data = {"name": "Invalid search", "params": "invalid_data"}

        self.client.login(**self.user_1_credentials)
        response = self.client.get(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "Patched search")

        response = self.client.patch(
            self.url + f"{self.search.id}/", data=invalid_data
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.get(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "Patched search")
        self.assertNotContains(response, "Invalid search")

        # Modify not existing search
        self.client.login(**self.user_1_credentials)
        response = self.client.patch(
            self.url + f"{len(SavedSearch.objects.all()) + 1}/",
            data=valid_data,
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_user_can_patch_only_own_search(self):
        self.assertTrue(
            self.search in SavedSearch.objects.filter(user=self.user_1)
        )
        self.assertFalse(
            self.search in SavedSearch.objects.filter(user=self.user_2)
        )

        valid_data = {
            "name": "Patched search",
        }

        self.client.login(**self.user_2_credentials)
        response = self.client.patch(
            self.url + f"{self.search.id}/", data=valid_data
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        self.client.login(**self.user_1_credentials)
        response = self.client.get(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotContains(response, "Patched search")
        self.assertContains(response, "Saved search")

    def test_delete_saved_search(self):
        # Delete existing saved search
        self.client.login(**self.user_1_credentials)
        self.assertEqual(
            len(SavedSearch.objects.filter(user=self.user_1)),
            self.saved_search_count,
        )
        response = self.client.delete(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(
            len(SavedSearch.objects.filter(user=self.user_1)),
            self.saved_search_count - 1,
        )

        # Delete not existing saved search
        response = self.client.delete(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            len(SavedSearch.objects.filter(user=self.user_1)),
            self.saved_search_count - 1,
        )

    def test_user_can_delete_only_own_searches(self):
        # user_2 trying to delete user_1's saved search
        self.assertEqual(
            len(SavedSearch.objects.filter(user=self.user_1)),
            self.saved_search_count,
        )
        self.assertTrue(
            self.search in SavedSearch.objects.filter(user=self.user_1)
        )
        self.assertFalse(
            self.search in SavedSearch.objects.filter(user=self.user_2)
        )
        self.client.login(**self.user_2_credentials)
        response = self.client.delete(self.url + f"{self.search.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            len(SavedSearch.objects.filter(user=self.user_1)),
            self.saved_search_count,
        )

    @patch("core.throttles.SavedSearchMinThrottle.get_rate")
    def test_searches_throttling_min(self, mock):
        mock.return_value = "3/min"
        SavedSearchViewSet.throttle_classes = [SavedSearchMinThrottle]

        self.client.login(**self.user_1_credentials)

        for _ in range (0, 3):
            response = self.client.get(self.url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data["detail"].code, "throttled")

    @patch("core.throttles.SavedSearchHourThrottle.get_rate")
    def test_searches_throttling_hour(self, mock):
        mock.return_value = "5/hour"
        SavedSearchViewSet.throttle_classes = [SavedSearchHourThrottle]

        self.client.login(**self.user_1_credentials)

        for _ in range (0, 5):
            response = self.client.get(self.url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data["detail"].code, "throttled")

    @patch("core.throttles.SavedSearchDayThrottle.get_rate")
    def test_searches_throttling_day(self, mock):
        mock.return_value = "10/day"
        SavedSearchViewSet.throttle_classes = [SavedSearchDayThrottle]

        self.client.login(**self.user_1_credentials)

        for _ in range (0, 10):
            response = self.client.get(self.url)
            self.assertEqual(response.status_code, status.HTTP_200_OK)

        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data["detail"].code, "throttled")
