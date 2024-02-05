import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { Sqs } from './construct/sqs'
import { SqsLambdaTrigger } from './construct/sqs-lambda-trigger'

const namePrefix = 'LearnSqsLambdaTrigger'

export class LearnSqsLambdaTrigger extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // SQSの作成
    const queue = new Sqs(this, 'Sqs', {
      namePrefix: namePrefix,
    }).queue

    // Lambdaの作成
    const receiveSqsMessageFunction = new SqsLambdaTrigger(this, 'SqsLambdaTrigger', {
      namePrefix: namePrefix,
      queue: queue,
    }).receiveSqsMessageFunction

    // LambdaのイベントソースとしてSQSを追加
    this.addSqsEventSourceToLambda(receiveSqsMessageFunction, queue)

    new CfnOutput(this, 'QueueUrl', {
      value: queue.queueUrl,
    })
  }

  private addSqsEventSourceToLambda(lambda: NodejsFunction, queue: Queue): void {
    const eventSource = new SqsEventSource(queue, {
      batchSize: 1,
    })
    lambda.addEventSource(eventSource)
  }
}
