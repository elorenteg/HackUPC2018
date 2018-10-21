import boto3
import json

def respond(err, res=None, d_type=None):
    if d_type:
        res = [x for x in res['Items'] if x['data_type'] == d_type]
    
    return {
        'statusCode': '400' if err else '200',
        'body': err.message if err else res,
        'headers': {
            'Content-Type': 'application/json',
        },
    }


def lambda_handler(event, context):
    '''HTTP endpoint using API Gateway.

    To scan a DynamoDB table, make a GET request with the TableName as a
    query string parameter. To put, update, or delete an item, make a POST,
    PUT, or DELETE request respectively, passing in the payload to the
    DynamoDB API as a JSON body.
    '''
    print("Received event: " + json.dumps(event, indent=2))

    operations = {
        'DELETE': lambda dynamo, x: dynamo.delete_item(**x),
        'GET': lambda dynamo, x: dynamo.scan(**x),
        'POST': lambda dynamo, x: dynamo.put_item(**x),
        'PUT': lambda dynamo, x: dynamo.update_item(**x),
    }

    operation = event['httpMethod']
    if operation in operations:
        table = boto3.resource('dynamodb').Table('HackUPC2018')
        
        d_type = event.get('filter') if operation == 'GET' else None
        payload = event.get('queryStringParameters') if operation == 'GET' else event['body']
        
        return respond(None, operations[operation](table, payload), d_type)
    else:
        return respond(ValueError('Unsupported method "{}"'.format(operation)))
