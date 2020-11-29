'use strict'
const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()
var lambda = new AWS.Lambda({
    region: 'eu-west-1' //change to your region
  });
const TableName = process.env.commentTable_name

exports.main = async (event) => {
    // todo some logic which allows admins to approve a comment    
    if(event.httpMethod === "POST") {
        const comment = JSON.parse(event.body);
        // if we adding a new comment trigger the state machine
        if(comment.task === 'add') {
            const params = {
                stateMachineArn: process.env.statemachine_arn,
                input: event.body
            }
            const stepfunctions = new AWS.StepFunctions()
            await stepfunctions.startExecution(params).promise();
        } else if (comment.task === 'approve') {
            // otherwise if we are approving the comment trigger the approval lambda separately
            await lambda.invoke({
                FunctionName: process.env.aprrovalLambda_name,
                Payload: JSON.stringify(comment)
              }).promise()
        }
        const response = {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                'Access-Control-Allow-Credentials': true,
            },
            body: 'successfull'
        };
        return response;
    } else if (event.httpMethod === "GET"){
        let documentid ='';
        if(event.pathParameters && event.pathParameters.document) {
            documentid = event.pathParameters.document;
        }
        const params = {
            TableName
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
}