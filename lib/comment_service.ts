import * as core from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as tasks from '@aws-cdk/aws-stepfunctions-tasks';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export class CommentService extends core.Construct {
    constructor(scope: core.Construct, id: string) {
        super(scope, id);

        // create the dynamodb table we will be storing comments in.
        const commentTable = new dynamodb.Table(this, 'commentTable', {
            partitionKey: { name: 'commentid', type: dynamodb.AttributeType.STRING },
            removalPolicy: core.RemovalPolicy.DESTROY
        });

         // create the dynamodb table we will be storing comments in.
        const commentPost = new lambda.Function(this, "CommentPost", {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset("lambdas/comment-statemachine"),
            handler: "commentPost.main",
            environment: {
                TABLE: commentTable.tableName
            }
        });

        const commentShouldApprove = new lambda.Function(this, "commentShouldApprove", {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset("lambdas/comment-statemachine"),
            handler: "commentShouldApprove.main",
        });

        const commentApprove = new lambda.Function(this, "CommentApprove", {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset("lambdas/comment-statemachine"),
            handler: "commentApprove.main",
            environment: {
                TABLE: commentTable.tableName
            }
        });
        
        // let the statemachine lambdas write to dynamodb
        commentTable.grantWriteData(commentPost);
        commentTable.grantWriteData(commentApprove);

        const step1 = new tasks.LambdaInvoke(this, 'Submit Job', {
            lambdaFunction: commentPost,
            // Lambda's result is in the attribute `Payload`
            outputPath: '$.Payload',
          });

        const step2 = new tasks.LambdaInvoke(this, 'Should Approve', {
            lambdaFunction: commentShouldApprove,
            // Lambda's result is in the attribute `Payload`
            inputPath: '$.comment',
            outputPath: '$.Payload',
          });
          
          
        const step3 = new tasks.LambdaInvoke(this, 'Approve', {
            lambdaFunction: commentApprove,
            // Pass just the field named "documentid" into the Lambda, put the
            // Lambda's result in a field called "status" in the response
            inputPath: '$.comment',
            outputPath: '$.Payload',
        });

        const success = new sfn.Succeed(this, 'We did it!');

        /*
            STATE MACHINE DEFINITION
            Step 1: push the comment to dynamodb , with approved as false.
            Step 2: pass the comment to check if it can be approved automatically
            Choice: 
                - Step 3: Update the record in dynamo to be approved then return success
                - Else Update the record in dynamo to be approved then return success
        */

        const definition = step1
            .next(step2)
            .next(new sfn.Choice(this, 'Should Approve?')
                .when(sfn.Condition.stringEquals('$.status', 'YES'), step3.next(success))
                .otherwise(success))
           
        const commentStateMachine = new sfn.StateMachine(this, 'StateMachine', {
            definition,
        });

        // define a lambda to to handle the responses to the api gateway
        const commentHandler = new lambda.Function(this, "CommentHandler", {
            runtime: lambda.Runtime.NODEJS_12_X,
            code: lambda.Code.fromAsset("lambdas/comment-handler"),
            handler: "commentHandler.main",
            environment: {
                commentTable_name: commentTable.tableName,
                statemachine_arn: commentStateMachine.stateMachineArn,
                aprrovalLambda_name: commentApprove.functionName
            }
        });
        
        // grant commentHandler lambda permission
        commentStateMachine.grantStartExecution(commentHandler);
        commentTable.grantReadData(commentHandler);
        commentApprove.grantInvoke(commentHandler)

        // describe the lambda integration for the api endpoint
        const commentsBackend = new apigateway.LambdaIntegration(commentHandler, {
            requestTemplates: { "application/json": '{ "statusCode": "200" }' },
        });

        // create the api endpoint
        const commentServiceApi = new apigateway.RestApi(this, "archive-comment-service-api", {
            restApiName: "Comment Service",
            description: "This service handles adding and approving comments for documents",
            defaultIntegration: commentsBackend
        });

        // set up the comments resource
        const document = commentServiceApi.root.addResource('{document}');
        const comments = document.addResource('comments');
        comments.addMethod('GET'); // GET /{document}/comments
        comments.addMethod('POST'); // POST /{document}/comments
        comments.addMethod('OPTIONS'); // OPTIONS /{document}/comments

        const comment = comments.addResource('{comment}');
        comment.addMethod('GET');   // GET /{document}/comments/{comment}
        comment.addMethod('POST');  // POST /{document}/comments/{comment}
    }
}

export default CommentService