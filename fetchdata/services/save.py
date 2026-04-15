from core.models import Place
from .transform import NODE_FIELDS


def save_places_to_db(transformed_data: list[dict]):
    bulk_list = []

    # Set all fields for Place instance except 'slug' field
    for place_data in transformed_data:
        place = Place()
        bulk_list.append(place)

        # Set values for Place instance
        for field in NODE_FIELDS.keys():
            setattr(place, field, place_data[field])

    # Set 'slug' field for Place objects
    used_slugs = set()
    for place_obj in bulk_list:
        place_obj.prepare(used_slugs)

    # Save places to DataBase
    Place.objects.bulk_create(bulk_list, ignore_conflicts=True)
