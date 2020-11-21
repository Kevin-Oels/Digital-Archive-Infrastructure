'use strict'
var AWS = require('aws-sdk'),
documentClient = new AWS.DynamoDB.DocumentClient()
const TableName = process.env.TABLE

exports.main = function(event, context, callback){
    // todo some logic which writes comments to a table
    // todo some logic which allows admins to approve a comment
    // todo auto approval logic. 
}