# Favorite places endpoints
**Only authenticated users can access endpoints**

---

## GET list | GET detail
Returns paginated list of user's favorite places | Returns detail page of user's favorite place 

### Endpoint

#### List
`GET` list also supports: filtering, ordering, search, calculated distance with query parameters as default `/api/places/` endpoint

##### Default
**GET** `/api/places/favorite/`

##### With filtering, ordering, geo distance
**GET** `/api/places/favorite/?lat=48&lon=2&radius=100&city=2&ordering=-name`

#### Detail
`GET` detail also supports calculated distance with query parameters

##### Default
**GET** `/api/places/1/favorite/`

##### With geo distance
**GET** `/api/places/1/favorite/?lat=48&lon=2`

### Payloads:

#### Request:
**GET** `/api/places/favorite/?lat=48&lon=2`

#### Payload:
```json
{
    "count": 6,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 4000,
            "distance": 946.21,
            "name": "Max Brown",
            "slug": "max-brown",
            "address": "Uhlandstraße 49 10719",
            "latitude": "52.4968861",
            "longitude": "13.3238309",
            "rating": null,
            "price_level": null,
            "opening_status": null,
            "category": 16,
            "sourcerecord": 8,
            "city": 66
        },
    ]
}
```

---
## POST
Add place to user's favorite places

### Endpoint
**POST** `/api/places/1/favorite/`

### Payload Examples

#### Successful:

```json
{
    "message": "Place was successfully saved to favorite places!"
}
```

#### Already exists in favorite places:

```json
{
    "message": "Place with id 1 already in favorite places!"
}
```

#### Not existing place:

```json
{
    "detail": "No Place matches the given query."
}
```

---

## DELETE
Delete place from user's favorite places

### Endpoint
**DELETE** `/api/places/1/favorite/`

### Payload Examples:

#### Successful:

```json
{
    "message": "Place was successfully removed from favorite places!"
}
```

#### Already deleted place:

```json
{
    "message": "Place with id 1 is not in favorite places!"
}
```

#### Not existing place:

```json
{
    "detail": "No Place matches the given query."
}
```

---