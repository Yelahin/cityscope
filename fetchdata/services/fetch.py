import overpy
from core.models import SourceRecord, Category, City
from cityscope.settings.base import OVERPASS_API_ENDPOINT, MAX_RETRY_COUNT
from .transform import get_transformed_data
from .save import save_places_to_db
import logging

# Set up logger
logger = logging.getLogger(__name__)

api = overpy.Overpass(
    url=OVERPASS_API_ENDPOINT,
    max_retry_count=MAX_RETRY_COUNT,
)


def fetch_overpass_api(query) -> tuple[list, SourceRecord]:
    queries = api.query(query=query)
    overpass_source, created = SourceRecord.objects.get_or_create(
        name="Overpass", source_type=SourceRecord.API
    )
    return (queries.nodes, overpass_source)


# Normalize and upload to database fetched data from query
def upload_data_to_database(query: str):
    try:
        # Get transformed data
        nodes = fetch_overpass_api(query)
        normalized_data = get_transformed_data(nodes)

        # Save data
        save_places_to_db(normalized_data)

    # Exceptions
    except overpy.exception.OverPyException:
        logger.exception("Overpy error occured!")
        raise
    except Exception:
        logger.exception("Something went wrong!")
        raise
