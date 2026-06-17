import logging

import overpy

from cityscope.settings.base import MAX_RETRY_COUNT, OVERPASS_API_ENDPOINT
from core.models import Category, City, SourceRecord

from .save import save_places_to_db
from .transform import get_transformed_data
from .utils import category_tags

# Set up logger
logger = logging.getLogger(__name__)

# Set up Overpass API
api = overpy.Overpass(
    url=OVERPASS_API_ENDPOINT,
    max_retry_count=MAX_RETRY_COUNT,
)


# Normalize and upload to database fetched data from query
def upload_data_to_database(query: str, city: City) -> None:
    try:
        # Get transformed data
        elements = fetch_overpass_api(query)
        normalized_data = get_transformed_data(elements, city)

        # Save data
        save_places_to_db(normalized_data)

    # Exceptions
    except overpy.exception.OverPyException:
        logger.exception("Overpy error occured!")
        raise
    except Exception:
        logger.exception("Something went wrong!")
        raise


# Returns response from Overpass API and return source type
def fetch_overpass_api(query: str) -> tuple[list, SourceRecord]:
    queries = api.query(query=query)
    overpass_source, created = SourceRecord.objects.get_or_create(
        name="Overpass", source_type=SourceRecord.API
    )

    # Filter raw api response to data that related to places
    elements = queries.nodes + queries.ways + queries.relations

    return elements, overpass_source


# Returns Overpass QL request using category and city filters
def get_overpass_query(category: Category, city: City) -> str:
    # Transform human readable cateogry to Overpass QL version
    cat = category.name
    tag = category_tags[cat]["tag"]
    value = category_tags[cat]["value"]

    query = f"""
    [out:json][timeout:25];
    (
        area["name:en"="{city.name}"];
        area["name"="{city.name}"];
    )->.city;
    (
        node["{tag}"="{value}"](area.city);
        way["{tag}"="{value}"](area.city);
        relation["{tag}"="{value}"](area.city);
    );
    out center;
    """

    return query
