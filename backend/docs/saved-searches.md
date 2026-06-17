# Saved searches endpoints
**Only authenticated users can access endpoints**

---

## GET list | GET detail
Returns paginated list of user's saved searches | Returns detail page of user's saved search

### Endpoint

#### List
`GET` list supports ordering and search

##### Default 
**GET** `/api/searches/`

##### With ordering and search
**GET** `/api/searches/?ordering={ordering}&search={name}`

#### Detail

**GET** `/api/searches/1/`

### Ordering

Allowed ordering by:
- `id` - ascending
- `id` - descending
- `name` - ascending
- `name` - descending

#### Example
- ascending: `/api/searches/?ordering=id`
- descending: `/api/searches/?ordering=-id`

### Search

Search allowed by fields:
- `name`

#### Example
- `name`: `/api/searches/?search=Saved Search 1`

### Payload Example

#### Request:

**GET** `/api/searches/?search=First search`

```json
{
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "First search",
            "params": {
                "lat": 23,
                "lon": 43,
                "radius": 3000
            },
            "user": 1
        }
    ]
}
```

--- 

## POST
Create new saved search for user

### Endpoint 

**POST** `/api/searches/`

### Payload Examples

#### Successful:
```json
{
    "id": 1,
    "name": "Gyms",
    "params": {
        "category": 1
    },
    "user": 1
}
```

#### Invalid params
```json
{
    "params": [
        "Value must be valid JSON."
    ]
}
```

---

## PUT
Update complete saved search

### Endpoint

**PUT** `/api/searches/1/`

### Payload Example

```json
{
    "id": 1,
    "name": "Parks",
    "params": {
        "category": 2
    },
    "user": 1
}
```

---

## PATCH
Update particular field of saved search

### Endpoint

**PATCH** `/api/searches/1/`

### Payload Example

```json
{
    "id": 1,
    "name": "Favorite Parks",
    "params": {
        "category": 2
    },
    "user": 1
}
```

---

## DELETE
Delete user's saved search

### Endpoint

**DELETE** `/api/searches/1/`

### Payload Example

#### Successful
Return nothing. **Status** `204 No Content`

#### Not existing saved search
```json
{
    "detail": "No SavedSearch matches the given query."
}
```