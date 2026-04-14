import overpy
from core.models import SourceRecord

api = overpy.Overpass(
    url="https://overpass.private.coffee/api/interpreter", 
    max_retry_count=5,
)

def fetch_overpass_api(query):
    queries = api.query(query=query)
    overpass_source, created = SourceRecord.objects.get_or_create(name="Overpass", source_type=SourceRecord.API)
    return (queries.nodes, overpass_source)