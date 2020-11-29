import * as core from "@aws-cdk/core"
import * as apigateway from "@aws-cdk/aws-apigateway"
import * as lambda from "@aws-cdk/aws-lambda"
import * as dynamodb from "@aws-cdk/aws-dynamodb"
import { Bucket, HttpMethods } from "@aws-cdk/aws-s3"
import * as cognito from "@aws-cdk/aws-cognito"

export class ArchiveService extends core.Construct {
    constructor(scope: core.Construct, id: string) {
        super(scope, id)

        // create the bucket we will be storing documents in
        new Bucket(this, 'ArchiveStore', {
            cors:[{
                allowedHeaders: [`*`],
                allowedMethods: [HttpMethods.GET, HttpMethods.POST, HttpMethods.DELETE, HttpMethods.PUT ],
                allowedOrigins: [`*` ]
              }],
            removalPolicy: core.RemovalPolicy.DESTROY
        });

        // create the dynamodb table we will be storing pdf meta data in.
        const documentTable = new dynamodb.Table(this, 'documentTable', {
            partitionKey: { name: 'documentid', type: dynamodb.AttributeType.STRING },
            removalPolicy: core.RemovalPolicy.DESTROY
            })

        // define a lambda to handle writing files to the archive store bucket
        const archiveStoreHandler = new lambda.Function(this, "ArchiveStoreHandler", {
            runtime: lambda.Runtime.NODEJS_12_X, // So we can use async in archiveStoreHandler.js
            code: lambda.Code.fromAsset("lambdas/store-handler"),
            handler: "archiveStoreHandler.main",
            environment: {
                TABLE: documentTable.tableName
            }
        })

        // give the handler access to the dynamodb table & bucket
        documentTable.grantReadWriteData(archiveStoreHandler);
  
        // describe the lambda integration for the api endpoint
        const archiveBackend = new apigateway.LambdaIntegration(archiveStoreHandler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' }
        })

        // create the api endpoint
            const archiveUploadApi = new apigateway.RestApi(this, "archive-upload-api", {
            restApiName: "Archive Upload Service",
            description: "This service allows users to upload documents with metadata.",
            defaultIntegration: archiveBackend
        })
        
        const items = archiveUploadApi.root.addResource('items');
        items.addMethod('GET'); // GET /items
        items.addMethod('POST'); // POST /items
        items.addMethod('OPTIONS'); // OPTIONS /items

        const item = items.addResource('{item}');
        item.addMethod('GET');   // GET /items/{item}
    }
}

export default ArchiveService