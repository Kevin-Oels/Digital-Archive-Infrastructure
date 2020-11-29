'use strict'
const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient();

exports.main = async (comment, context, callback) => { 
    const params = {
        TableName: process.env.TABLE,
        Key: {
            "commentid": comment.commentid,
        },
        UpdateExpression: "set approved = :approved",
        ExpressionAttributeValues: {
            ":approved": true,
        }
    };
    await docClient.update(params).promise();
    callback(null, {comment: comment});
}