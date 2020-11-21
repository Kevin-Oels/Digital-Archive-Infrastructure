import * as core from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import { Bucket } from "@aws-cdk/aws-s3";

export class ArchiveService extends core.Construct {
    constructor(scope: core.Construct, id: string) {
        super(scope, id);

        // create the bucket we will be storing documents in
        const archiveStorage = new Bucket(this, 'ArchiveStore')

        // create the dynamodb table we will be storing pdf meta data in.
        const documentTable = new dynamodb.Table(this, 'documentTable', {
            partitionKey: { name: 'documentID', type: dynamodb.AttributeType.STRING },
            });

        // define a lambda to handle writing files to the archive store bucket
        const archiveStoreHandler = new lambda.Function(this, "ArchiveStoreHandler", {
            runtime: lambda.Runtime.NODEJS_12_X, // So we can use async in archiveStoreHandler.js
            code: lambda.Code.fromAsset("resources"),
            handler: "archiveStoreHandler.main",
            environment: {
                BUCKETARN: archiveStorage.bucketArn,
                BUCKETNAME: archiveStorage.bucketName,
                TABLE: documentTable.tableName
            }
        });

        // give the handler access to the dynamodb table & bucket
        documentTable.grantReadData(archiveStoreHandler);
        archiveStorage.grantPut(archiveStoreHandler);
    
        // create the api endpoint
        const archiveUploadApi = new apigateway.RestApi(this, "archive-upload-api", {
            restApiName: "Archive Upload Service",
            description: "This service allows users to upload documents with meta data."
        });
  
        // describe the lambda integration for the api endpoint
        const getStoresIntegration = new apigateway.LambdaIntegration(archiveStoreHandler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
        });
        
        // apply the lambda integration to the GET method
        archiveUploadApi.root.addMethod("GET", getStoresIntegration); // GET /
    }
}

export default ArchiveService