import { Construct } from 'constructs';
import {
  Effect,
  IRole,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { BaseNodejsFunction } from '../base/base-nodejs-function';

export interface SqsLambdaTriggerProps {
  namePrefix: string;
  queue: Queue;
}

export class SqsLambdaTrigger extends Construct {
  public readonly receiveSqsMessageFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props: SqsLambdaTriggerProps) {
    super(scope, id);

    const { namePrefix, queue } = props;

    const role = this.createLambdaTriggerRole(namePrefix, queue);
    const func = this.createReceiveSqsMessageFunction(namePrefix, role);

    this.receiveSqsMessageFunction = func;
  }

  private createLambdaTriggerRole(namePrefix: string, queue: Queue): IRole {
    const lambdaTriggerRole = new Role(this, 'ReceiveSqsMessageLambdaRole', {
      roleName: `${namePrefix}-receive-sqs-message-lambda-role`,
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        {
          managedPolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
        },
      ],
      inlinePolicies: {
        ReceiveSqsMessagePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: [
                'sqs:ChangeMessageVisibility',
                'sqs:DeleteMessage',
                'sqs:GetQueueAttributes',
                'sqs:GetQueueUrl',
                'sqs:ReceiveMessage',
              ],
              resources: [queue.queueArn],
            }),
          ],
        }),
      },
    });

    return lambdaTriggerRole.withoutPolicyUpdates();
  }

  private createReceiveSqsMessageFunction(namePrefix: string, role: IRole): NodejsFunction {
    return new BaseNodejsFunction(this, 'ReceiveSqsMessageLambda', {
      functionName: `${namePrefix}-receive-sqs-message`,
      entry: './lambda/receiveSqsMessageLambdaTrigger.ts',
      role: role,
    });
  }
}
