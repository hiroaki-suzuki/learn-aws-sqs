import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Sqs } from './construct/sqs';
import { StepFunctions } from './construct/step-functions';
import { EventBridgePipe } from './construct/event-bridge-pipe';
import { EnvValues } from './env/env-values';

export interface LearnSqsEventPipeStateProps extends cdk.StackProps {
  readonly namePrefix: string;
  readonly envValues: EnvValues;
}

export class LearnSqsEventPipeState extends cdk.Stack {
  constructor(scope: Construct, id: string, props: LearnSqsEventPipeStateProps) {
    super(scope, id, props);

    const { namePrefix } = props;

    // SQSの作成
    const queue = new Sqs(this, 'Sqs', {
      namePrefix: namePrefix,
    }).queue;

    // Step FunctionsのState作成
    const stateMachine = new StepFunctions(this, 'StepFunctions', {
      namePrefix: namePrefix,
    }).stateMachine;

    new EventBridgePipe(this, 'EventBridgePipe', {
      namePrefix: namePrefix,
      queue: queue,
      stateMachine: stateMachine,
    });

    new cdk.CfnOutput(this, 'QueueUrl', {
      value: queue.queueUrl,
    });
  }
}
