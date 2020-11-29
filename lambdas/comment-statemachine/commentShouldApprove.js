'use strict'
const AWS = require('aws-sdk')
const ddb = new AWS.DynamoDB;

exports.main = async (comment, context, callback) => {
    console.log(comment)
    let canApprove = false;

    if(comment.commenttext.includes('auto-approve')) {
        canApprove = true;
    }
    
    const response = {
        status: canApprove ? 'YES' : 'NO',
        comment: comment
    }   
    
    callback(null, response);
}