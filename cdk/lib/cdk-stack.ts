import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'

export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const queue = new sqs.Queue(this, 'TestQueue', {
      queueName: 'TestQueue'
    })

    const tesQueueFunction = new NodejsFunction(this, 'TestQueueFunction', {
      entry: './lambda/receiveSqsTrigger.ts',
      handler: 'handler',
      environment: {
        QUEUE_URL: queue.queueUrl
      }
    })
    tesQueueFunction.addEventSource(new SqsEventSource(queue))

    new cdk.CfnOutput(this, 'QueueUrl', {
      value: queue.queueUrl
    })

    new cdk.CfnOutput(this, 'TesQueueFunction', {
      value: tesQueueFunction.functionArn
    })
  }
}
