from django.conf import settings
from rest_framework import exceptions
from rest_framework.authentication import CSRFCheck
from rest_framework_simplejwt.authentication import JWTAuthentication


def enforce_csrf(request):
    check = CSRFCheck(lambda request: None)
    check.process_request(request)
    reason = check.process_view(request, None, (), {})
    if reason:
        raise exceptions.PermissionDenied(f"CSRF failed: {reason}")


class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = self.get_header(request)

        if header is None:
            raw_token = request.COOKIES.get(settings.SIMPLE_JWT["AUTH_COOKIE"])
            uses_cookie = True
        else:
            raw_token = self.get_raw_token(header)
            uses_cookie = False

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        if uses_cookie:
            enforce_csrf(request)

        return self.get_user(validated_token), validated_token
