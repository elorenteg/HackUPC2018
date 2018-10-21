# City Analyzer

## Frontend - React + Leaflet
### How to run

```
npm install
npm run app
```

## Backend - Amazon Web Services
### API Gateway

Base endpoint:
https://cxi66ge4ng.execute-api.us-east-1.amazonaws.com/prod/

#### GET Resources
Same URL as the endpoint. Do a POST call with this values in the body as raw. The 'filter' is an optional field, matches with the 'data_type', empty string returns all items.

```json
{
  "httpMethod": "GET",
  "queryStringParameters": {},
  "filter": "Air Quality - PM10"
}
```

#### POST Resources
```json
{
  "httpMethod": "POST",
  "queryStringParameters": {},
  "body": {
    "Item": {
      "data_types": "1",
      "values": [
        {
            "latitude": "41,2448",
            "value": 0,
            "longitude": "1,6177"
        }
      ],
      "data_type": "Air Quality - PM10",
      "range": "0-100"
    }
  }
}
```

### Lambda

### DynamoDB
