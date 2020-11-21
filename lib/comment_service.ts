import * as core from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { Bucket } from "@aws-cdk/aws-s3";

export class CommentService extends core.Construct {
    constructor(scope: core.Construct, id: string) {
        super(scope, id);

        // create the dynamodb table we will be storing pdf comments in.
        const commentTable = new dynamodb.Table(this, 'commentTable', {
        partitionKey: { name: 'documentID', type: dynamodb.AttributeType.STRING },
        });
        // define a lambda to allow users to add comments to a pdf
        const commentHandler = new lambda.Function(this, "CommentHandler", {
            runtime: lambda.Runtime.NODEJS_12_X, // So we can use async in commentHandler.js
            code: lambda.Code.fromAsset("resources"),
            handler: "commentHandler.main",
            environment: {
                TABLE: commentTable.tableName
            }
        });
        commentTable.grantReadWriteData(commentHandler);
        
        // create the api endpoint
        const commentServiceApi = new apigateway.RestApi(this, "archive-comment-service-api", {
            restApiName: "Comment Service",
            description: "This service handles adding and approving comments for documents"
        });

        // describe the lambda integration for the api endpoint
        const getStoresIntegration = new apigateway.LambdaIntegration(commentHandler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
        });
        
        // apply the lambda integration to the GET method
        commentServiceApi.root.addMethod("GET", getStoresIntegration); // GET /
    }
}

export default CommentService