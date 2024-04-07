import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Sqs } from './construct/sqs';
import { EnvValues } from './env/env-values';

export interface LearnSqsProps extends StackProps {
  readonly namePrefix: string;
  readonly envValues: EnvValues;
}

export class LearnSqs extends Stack {
  constructor(scope: Construct, id: string, props: LearnSqsProps) {
    super(scope, id, props);

    const { namePrefix } = props;

    // SQSの作成
    const queue = new Sqs(this, 'Sqs', {
      namePrefix: namePrefix,
    }).queue;

    new CfnOutput(this, 'QueueUrl', {
      value: queue.queueUrl,
    });
  }
}
