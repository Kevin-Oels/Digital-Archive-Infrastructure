'use strict'

const AWS = require('aws-sdk');
var ddb = new AWS.DynamoDB;
var docClient = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE

exports.main = async (event) => {
    // todo write provided meta data to table
    if(event.httpMethod === "POST") {
        const metadata = JSON.parse(event.body)
        var params = {
          TableName: tableName,
          Item: {
            'documentid' : {S: metadata.fileId},
            'articlename' : {S: metadata.articlename},
            'year' : {S: metadata.year},
            'tags' : {SS: metadata.tags},
            'addedby' : {S: metadata.addedby},
          }
        };
        let result = await ddb.putItem(params).promise();
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify(result)
        };
        return response;
    } else if (event.httpMethod === "GET"){
        let documentid ='';
        if(event.pathParameters && event.pathParameters.item) {
            documentid = event.pathParameters.item;
        }
        if(event.pathParameters && event.pathParameters.item) {
            documentid = event.pathParameters.item;
        }
        const params = {
            TableName: tableName
        }
        
        if (documentid !== ''){
            params.FilterExpression = 'documentid = :documentid'
            params.ExpressionAttributeValues = {
                ":documentid": documentid
            }
        }
        
        let result = await docClient.scan(params).promise();
        
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify(result)
        };
        return response;
    } else {
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                'Access-Control-Allow-Credentials': true,
            },
            body: 'METHOD NOT SUPPORTED'
        };
        return response
    }
};