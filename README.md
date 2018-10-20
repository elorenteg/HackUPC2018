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
  "queryStringParameters": {}
}
```

#### POST Resources
```json
{
  "httpMethod": "POST",
  "queryStringParameters": {},
  "body": {
    "Item": {
      "ID": "An unique ID",
      "value": "A value"
    }
  }
}
```

### Lambda

### DynamoDB
