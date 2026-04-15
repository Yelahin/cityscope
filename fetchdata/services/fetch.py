import overpy
from core.models import SourceRecord
from cityscope.settings.base import OVERPASS_API_ENDPOINT, MAX_RETRY_COUNT

api = overpy.Overpass(
    url=OVERPASS_API_ENDPOINT, 
    max_retry_count=MAX_RETRY_COUNT,
)

def fetch_overpass_api(query):
    queries = api.query(query=query)
    overpass_source, created = SourceRecord.objects.get_or_create(name="Overpass", source_type=SourceRecord.API)
    return (queries.nodes, overpass_source)