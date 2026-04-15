import reverse_geocoder as rg
from unicodedata import normalize
from core.models import City, Category

NODE_FIELDS = {
    "name": lambda node: get_name_from_node(node),
    "address": lambda node: get_address_from_node(node),
    "longitude": lambda node: getattr(node, "lon", None),
    "latitude": lambda node: getattr(node, "lat", None),
    "sourcerecord": lambda node: node.tags.get("sourcerecord"),
    "category": lambda node: get_category_from_node(node),
    "city": lambda node: get_city_from_node(node),
    "rating": lambda node: get_rating_from_node(node),
    "price_level": lambda node: get_price_level_from_node(node),
    "opening_status": lambda node: get_opening_status_from_node(node),
}


def get_transformed_data(fetched_data: tuple[list, str]) -> list[dict]:
    sourcerecord = fetched_data[1]
    nodes = fetched_data[0].copy()

    nodes = add_city_for_nodes(nodes)

    transformed_nodes = []
    for node in nodes:
        transformed_data = transform_node(node, sourcerecord)
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
            transformed_nodes.append(transformed_data)
    return transformed_nodes


# Returns dict with transformed data for database schema
def transform_node(node, sourcerecord) -> dict:
    node.tags["sourcerecord"] = sourcerecord

    result = {key: value(node) for key, value in NODE_FIELDS.items()}
    return result


# Transform field functions


def add_city_for_nodes(nodes) -> list:
    nds = nodes.copy()
    coordinates = [(node.lat, node.lon) for node in nds]
    locations = rg.search(coordinates)
    for index in range(len(nds)):
        nds[index].tags["city"] = locations[index]["name"]
    return nds


def get_city_from_node(node) -> City:
    if node.tags.get("city") is not None:
        city, created = City.objects.get_or_create(name=node.tags.get("city"))
        return city


def get_name_from_node(node) -> str:
    name = node.tags.get("name")
    if name is not None:
        normalized_name = normalize("NFKD", name)
        ascii_text = normalized_name.encode(
            encoding="ascii", errors="ignore"
        ).decode("ascii")
        return ascii_text


def get_address_from_node(node) -> str:
    tags = [
        "addr:street",
        "addr:housenumber",
        "addr:postcode",
    ]

    address = [node.tags.get(tag) for tag in tags if node.tags.get(tag)]
    if any(address):
        return " ".join(address)


def get_category_from_node(node) -> Category:
    if node.tags.get("amenity") is not None:
        cat, created = Category.objects.get_or_create(
            name=node.tags.get("amenity").capitalize()
        )
        return cat


def get_rating_from_node(node) -> str:
    pass


def get_price_level_from_node(node) -> str:
    pass


def get_opening_status_from_node(node) -> bool:
    pass
