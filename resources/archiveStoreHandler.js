'use strict'
var AWS = require('aws-sdk'),
documentClient = new AWS.DynamoDB.DocumentClient()
const TableName = process.env.TABLE

exports.main = function(event, context, callback){
    // todo create function to upload files into s3
    // todo write provided meta data to table
}
