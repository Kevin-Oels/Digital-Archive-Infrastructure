'use strict'
const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB;

exports.main = async (comment, context, callback) => {
    console.log('received: ' + comment)

    const date = new Date().toISOString().
        replace(/T/, ' ').      // replace T with a space
        replace(/\..+/, '')     // delete the dot and everything after
        
    var params = {
        TableName: process.env.TABLE,
        Item: {
            'documentid' : {S: comment.documentid},
            'commentid' : {S: comment.commentid},
            'commenttext' : {S: comment.commenttext},
            'approved' : {BOOL: false},
            'addedby' : {S: comment.addedby},
            'dateadded': {S: date}
        }
    };
    await ddb.putItem(params).promise();
    callback(null, {comment: comment});
}