import logging
import time

import overpy
from celery import shared_task

from core.models import Category, City
from fetchdata.services.fetch import (
    get_overpass_query,
    upload_data_to_database,
)

logger = logging.getLogger(__name__)


def import_places_from_overpass(city_id: int, max_retries: int):
    city = City.objects.get(id=city_id)
    categories = Category.objects.all()
    query = get_overpass_query(city=city, categories=categories)


    for attempt in range(1, max_retries + 1):

        try:
            upload_data_to_database(query=query, city=city)
            return
        except overpy.exception.OverPyException:
            logger.exception(
                f"Overpy error occured during Celery background task! | retry: {attempt}/{max_retries}"
            )
            time.sleep(10)
        except Exception:
            logger.exception(
                f"Something went wrong during Celery background task! | retry: {attempt}/{max_retries}"
            )
            return
        
    logger.exception(
        f"Places for city: {city.name} was not uploaded after {max_retries} retries!"
    )


@shared_task
def import_all_places():
    print("Start import places!")
    for city_id in City.objects.values_list("id", flat=True):
        import_places_from_overpass(city_id, max_retries=3)