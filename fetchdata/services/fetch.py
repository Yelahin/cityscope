import overpy

api = overpy.Overpass(
    url="https://overpass.private.coffee/api/interpreter", 
    max_retry_count=5,
)

def fetch_overpass_api(query):
    result = api.query(query=query)
    return result