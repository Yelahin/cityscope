from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model

class RegisterUserTests(APITestCase):
    def setUp(self):
        self.url = reverse("api_user_registration")

    def test_get_method_not_allowed(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_register_with_valid_data(self):
        users_count = len(get_user_model().objects.all())
        self.assertEqual(users_count, 0)

        valid_data = {"username": "User_1", "password": "password-user-1"}
        response = self.client.post(self.url, valid_data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        users_count = len(get_user_model().objects.all())
        self.assertEqual(users_count, 1)
        self.assertTrue(get_user_model().objects.filter(username=valid_data["username"]).exists())

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
