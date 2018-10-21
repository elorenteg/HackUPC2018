## City Analyzer


## Amazon Web Services
### API Gateway

Base endpoint:
https://cxi66ge4ng.execute-api.us-east-1.amazonaws.com/prod/

#### GET Resources
Same URL as the endpoint. Do a POST call with this values in the body as raw:

```json
{
  "httpMethod": "GET",
  "queryStringParameters": {},
  "filter": "Air Quality - PM10" #Optional, don-t add if not needed.
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
