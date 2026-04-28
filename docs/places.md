# GET /api/places/ - List of places
Returns paginated list of places. If users geo coordinates provided sorts result by nearest to farthest 

---

## Endpoint

#### Default

`/api/places/`

#### With geo distance

`/api/places/?lat={latitude}&lon={longitude}`

## Query Parameters

`lat` and `lon` - **Float** type **not required** parameters. Stands for users geo coordinates: **latitude, longitude**. If coordinates provided **both should be specified**. Latitude value can be in range **-90 : 90**, longitude value can be in range **-180 : 180**

If `lat` and `lon` query parameters provided - each place will have `distance` field in result. This field stands for distance between users coordinates and place coordinates. **Unit: kilometers/miles**

## Filters
Filter allowed by fields:
- `name`: `/api/places/?name={name}`
- `city`: `/api/places/?city={city}`
- `address`: `/api/places/?address={address}`
- `category`: `/api/places/?category={category_id}}`
- `rating`: `/api/places/?rating={rating}`
- `price_level`: `/api/places/?price_level={price_level}`
- `opening_status`: `/api/places/?opening_status={opening_status}`

`/api/places/?lat=51&lon=-21&page=1`

## Payload Examples


##### Request:
`/api/places/?page=1`

##### Payload:

```json
{
    "count": 1763,
    "next": "http://localhost:8000/api/places/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1961,
            "name": "David Lloyd Colliers Wood",
            "slug": "david-lloyd-colliers-wood",
            "address": "Chapter Way 29 SW19 2RF",
            "latitude": "51.4141907",
            "longitude": "-0.1801802",
            "rating": null,
            "price_level": null,
            "opening_status": null,
            "category": 12,
            "sourcerecord": 8,
            "city": 64
        }
    ]
}
```

---

#### With users coordinates

##### Request:
`/api/places/?lat=51&lon=-21&page=1`

##### Payload:


```json
{
    "count": 1763,
    "next": "http://localhost:8000/api/places/?lat=51&lon=-21&page=2",
    "previous": null,
    "results": [
        {
            "id": 2725,
            "distance": 1423.89,
            "name": "Simply Gym Uxbridge",
            "slug": "simply-gym-uxbridge",
            "address": null,
            "latitude": "51.5487323",
            "longitude": "-0.4821902",
            "rating": null,
            "price_level": null,
            "opening_status": null,
            "category": 12,
            "sourcerecord": 8,
            "city": 64
        }
    ]
}
```

---
