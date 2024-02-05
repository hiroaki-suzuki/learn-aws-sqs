import { Construct } from 'constructs'
import {
  Effect,
  IRole,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Duration, RemovalPolicy } from 'aws-cdk-lib'
import { Queue } from 'aws-cdk-lib/aws-sqs'

export interface SqsLambdaTriggerProps {
  namePrefix: string
  queue: Queue
}

export class SqsLambdaTrigger extends Construct {
  public readonly receiveSqsMessageFunction: NodejsFunction

  constructor(scope: Construct, id: string, props: SqsLambdaTriggerProps) {
    super(scope, id)

    const { namePrefix, queue } = props

    const role = this.createLambdaTriggerRole(namePrefix, queue)
    const func = this.createReceiveSqsMessageFunction(namePrefix, role)
    this.createReceiveSqsMessageFunctionLogGroup(func)

    this.receiveSqsMessageFunction = func
  }

  private createLambdaTriggerRole(namePrefix: string, queue: Queue): IRole {
    const lambdaTriggerRole = new Role(this, 'ReceiveSqsMessageLambdaRole', {
      roleName: `${namePrefix}ReceiveSqsMessageLambdaRole`,
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
    })

    return lambdaTriggerRole.withoutPolicyUpdates()
  }

  private createReceiveSqsMessageFunction(namePrefix: string, role: IRole): NodejsFunction {
    return new NodejsFunction(this, 'ReceiveSqsMessageLambda', {
      functionName: `${namePrefix}ReceiveSqsMessage`,
      entry: './lambda/receiveSqsMessageLambdaTrigger.ts',
      handler: 'handler',
      role: role,
      timeout: Duration.seconds(30),
    })
  }

  private createReceiveSqsMessageFunctionLogGroup(func: NodejsFunction): LogGroup {
    return new LogGroup(this, 'ReceiveSqsMessageLambdaLogGroup', {
      logGroupName: `/aws/lambda/${func.functionName}`,
      retention: RetentionDays.ONE_YEAR,
      removalPolicy: RemovalPolicy.DESTROY,
    })
  }
}
