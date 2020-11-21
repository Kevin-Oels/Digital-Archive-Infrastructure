import * as cdk from '@aws-cdk/core'
import ArchiveService from './archive_service'
import CommentService from './comment_service'

export class DigitalArchiveInfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)
    new ArchiveService(this, 'archiveservice')
    new CommentService(this, 'commentservice')
  }
}
