import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { Sqs } from './construct/sqs'

const namePrefix = 'LearnSqs'

export class LearnSqs extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    // SQSの作成
    const queue = new Sqs(this, 'Sqs', {
      namePrefix: namePrefix,
    }).queue

    new CfnOutput(this, 'QueueUrl', {
      value: queue.queueUrl,
    })
  }
}
