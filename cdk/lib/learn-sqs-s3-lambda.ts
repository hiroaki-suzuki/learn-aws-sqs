import { Stack, StackProps } from 'aws-cdk-lib';
import { EnvValues } from './env/env-values';
import { Construct } from 'constructs';
import { Sqs } from './construct/sqs';
import { BaseBucket } from './base/base-bucket';
import { EventType } from 'aws-cdk-lib/aws-s3';
import { SqsDestination } from 'aws-cdk-lib/aws-s3-notifications';
import { SqsLambdaTrigger } from './construct/sqs-lambda-trigger';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

export interface LearnSqsS3LambdaStackProps extends StackProps {
  readonly namePrefix: string;
  readonly envValues: EnvValues;
}

export class LearnSqsS3LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: LearnSqsS3LambdaStackProps) {
    super(scope, id, props);

    const { namePrefix } = props;

    // SQSの作成
    const queue = new Sqs(this, 'Sqs', {
      namePrefix: namePrefix,
    }).queue;

    // SQS Lambda Trigger
    const receiveSqsMessageFunction = new SqsLambdaTrigger(this, 'SqsLambdaTrigger', {
      namePrefix: namePrefix,
      queue: queue,
    }).receiveSqsMessageFunction;

    // LambdaのイベントソースとしてSQSを追加
    this.addSqsEventSourceToLambda(receiveSqsMessageFunction, queue);

    // バケットの作成
    const bucket = new BaseBucket(this, 'Bucket', {
      bucketName: `${namePrefix}-bucket`,
    });
    bucket.addEventNotification(EventType.OBJECT_CREATED_PUT, new SqsDestination(queue));
  }

  private addSqsEventSourceToLambda(lambda: NodejsFunction, queue: Queue): void {
    const eventSource = new SqsEventSource(queue, {
      batchSize: 1,
    });
    lambda.addEventSource(eventSource);
  }
}
