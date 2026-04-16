import overpy
from core.models import SourceRecord
from cityscope.settings.base import OVERPASS_API_ENDPOINT, MAX_RETRY_COUNT
from .transform import get_transformed_data
from .save import save_places_to_db
import logging

api = overpy.Overpass(
    url=OVERPASS_API_ENDPOINT, 
    max_retry_count=MAX_RETRY_COUNT,
)

def fetch_overpass_api(query) -> tuple[list, SourceRecord]:
    queries = api.query(query=query)
    overpass_source, created = SourceRecord.objects.get_or_create(name="Overpass", source_type=SourceRecord.API)
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
    except overpy.exception.MaxRetriesReached:
        logging.exception("Max retries count was reached!")
    except overpy.exception.OverpassGatewayTimeout:
        logging.exception("Server is too busy!")
    except overpy.exception.ElementDataWrongType:
        logging.exception("Element does not match the expected type!")
    except overpy.exception.DataIncomplete:
        logging.exception("Try to improve the query or to resolve the missing data!")
    except overpy.exception.OverpassBadRequest:
        logging.exception("Query has syntax error!")
    except overpy.exception.OverpassRuntimeError:
        logging.exception("Runtime error!")
    except overpy.exception.OverpassTooManyRequests:
        logging.exception("Too many requests, status code 429!")
    except overpy.exception.OverpassUnknownContentType:
        logging.exception("Unknown content type was provided!")
    except overpy.exception.OverpassUnknownError:
        logging.exception("Unknown error occurred!")
    except overpy.exception.OverpassUnknownHTTPStatusCode:
        logging.exception("Unknown status code!")
    except Exception:
        logging.exception("Something went wrong!")
