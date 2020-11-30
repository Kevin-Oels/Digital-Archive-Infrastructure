# Welcome to Digital-Archive-Infrastructure:

This is the back end Infrastructurefor a digital archive.
It is seperated into two logical services:
The archive service for handling uploading files & data, It contains the root dynamodb table & s3 storage resources.
The comment service which handles adding user comments to articles.
The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
