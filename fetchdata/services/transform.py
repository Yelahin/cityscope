from unicodedata import normalize
from core.models import City, Category, SourceRecord
from string import punctuation, digits
import overpy
from .utils import category_tags


ELEMENTS_FIELDS = {
    "name": lambda element: get_name_from_element(element),
    "address": lambda element: get_address_from_element(element),
    "latitude": lambda element: get_latitude_from_element(element),
    "longitude": lambda element: get_longitude_from_element(element),
    "sourcerecord": lambda element: element.tags.get("sourcerecord"),
    "category": lambda element: get_category_from_element(element),
    "city": lambda element: element.tags.get("city"),
    "rating": lambda element: get_rating_from_element(element),
    "price_level": lambda element: get_price_level_from_element(element),
    "opening_status": lambda element: get_opening_status_from_element(element),
}


# Transform raw data from response to DataBase ready data
def get_transformed_data(fetched_data: tuple[list, SourceRecord], city: City) -> list[dict]:
    sourcerecord = fetched_data[1]
    elements = fetched_data[0].copy()

    # Transform data
    transformed_elements = []
    for element in elements:
        transformed_data = transform_element(element, sourcerecord, city)
        # Filter data with empty required fields
        if transformed_data is not None and all(
            [
                transformed_data["name"],
                transformed_data["longitude"],
                transformed_data["latitude"],
                transformed_data["category"],
                transformed_data["sourcerecord"],
                transformed_data["city"],
            ]
        ):
            transformed_elements.append(transformed_data)
    return transformed_elements


# Returns dict with transformed data for database schema
def transform_element(element, sourcerecord: SourceRecord, city: City) -> dict:
    element.tags["sourcerecord"] = sourcerecord
    element.tags["city"] = city

    result = {key: value(element) for key, value in ELEMENTS_FIELDS.items()}
    return result


# Transform field functions

def get_name_from_element(element) -> str | None:
    # Get name
    name = element.tags.get("name:en")
    if name is None:
        name = element.tags.get("name")

    # Transform name
    if name is not None:
        normalized_name = normalize("NFKD", name)
        ascii_text = normalized_name.encode(
            encoding="ascii", errors="ignore"
        ).decode("ascii")

        remove_sequence = punctuation + digits + " "

        if (
            len(ascii_text.translate(str.maketrans("", "", remove_sequence)))
            > 1
        ):
            return ascii_text


def get_address_from_element(element) -> str | None:
    tags = [
        "addr:street",
        "addr:housenumber",
        "addr:postcode",
    ]

    address = [element.tags.get(tag) for tag in tags if element.tags.get(tag)]
    if any(address):
        return " ".join(address)


def get_category_from_element(element) -> Category | None:
    category = None

    # Transform Overpass QL category name to human readable
    for key, value in category_tags.items():
        element_category = element.tags.get(value.get("tag"))
        if element_category is not None and element_category == value.get("value"):
            category = key
            break

    if category:
        cat, created = Category.objects.get_or_create(name=category)
        return cat


def get_latitude_from_element(element) -> float | None:
    latitude = None

    if isinstance(element, overpy.Node):
        try:
            latitude = element.lat
        except AttributeError:
            latitude = None

    elif isinstance(element, (overpy.Way, overpy.Relation)):
        try:
            latitude = element.center_lat
        except AttributeError:
            latitude = None

    return latitude


def get_longitude_from_element(element) -> float | None:
    longitude = None

    if isinstance(element, overpy.Node):
        try:
            longitude = element.lon
        except AttributeError:
            longitude = None

    elif isinstance(element, (overpy.Way, overpy.Relation)):
        try:
            longitude = element.center_lon
        except AttributeError:
            longitude = None

    return longitude


def get_rating_from_element(element) -> str:
    pass


def get_price_level_from_element(element) -> str:
    pass


def get_opening_status_from_element(element) -> bool:
    pass
