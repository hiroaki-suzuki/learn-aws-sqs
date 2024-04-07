import { Construct } from 'constructs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { RemovalPolicy } from 'aws-cdk-lib';

export interface SqsProps {
  namePrefix: string;
}

export class Sqs extends Construct {
  public readonly queue: Queue;

  constructor(scope: Construct, id: string, props: SqsProps) {
    super(scope, id);

    const { namePrefix } = props;

    this.queue = new Queue(this, 'Queue', {
      queueName: `${namePrefix}-queue`,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
