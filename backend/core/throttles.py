from rest_framework.throttling import SimpleRateThrottle

class CustomRateThrottle(SimpleRateThrottle):
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = request.user.pk

        else:
            ident = self.get_ident(request)

        return self.cache_format % {
            'scope': self.scope,
            'ident': ident,
        }


class CustomUserIPThrottle(SimpleRateThrottle):
    def get_cache_key(self, request, view):
        return self.cache_format % {
            'scope': self.scope,
            'ident': self.get_ident(request),
        }


class PlaceMinThrottle(CustomRateThrottle):
    scope = "places_min"


class PlaceHourThrottle(CustomRateThrottle):
    scope = "places_hour"


class PlaceDayThrottle(CustomRateThrottle):
    scope = "places_day"


class CategoryMinThrottle(CustomRateThrottle):
    scope = "categories_min"


class CategoryHourThrottle(CustomRateThrottle):
    scope = "categories_hour"


class CategoryDayThrottle(CustomRateThrottle):
    scope = "categories_day"


class CityMinThrottle(CustomRateThrottle):
    scope = "cities_min"


class CityHourThrottle(CustomRateThrottle):
    scope = "cities_hour"


class CityDayThrottle(CustomRateThrottle):
    scope = "cities_day"


class SavedSearchMinThrottle(CustomRateThrottle):
    scope = "searches_min"


class SavedSearchHourThrottle(CustomRateThrottle):
    scope = "searches_hour"


class SavedSearchDayThrottle(CustomRateThrottle):
    scope = "searches_day"


class LoginMinThrottle(CustomUserIPThrottle):
    scope = "login_min"


class LoginHourThrottle(CustomUserIPThrottle):
    scope = "login_hour"


class LoginDayThrottle(CustomUserIPThrottle):
    scope = "login_day"


class RegisterMinThrottle(CustomUserIPThrottle):
    scope = "register_min"


class RegisterHourThrottle(CustomUserIPThrottle):
    scope = "register_hour"


class RegisterDayThrottle(CustomUserIPThrottle):
    scope = "register_day"


class GetMeMinThrottle(CustomUserIPThrottle):
    scope = "get_me_min"

class GetMeHourThrottle(CustomUserIPThrottle):
    scope = "get_me_hour"