import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import {
  DefinitionBody,
  LogLevel,
  StateMachine,
  Succeed,
  Wait,
  WaitTime,
} from 'aws-cdk-lib/aws-stepfunctions';
import { LambdaInvoke } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Duration } from 'aws-cdk-lib';
import { EventBridgeLambda } from './event-bridge-lambda';
import {
  Effect,
  IRole,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { BaseLogGroup } from '../base/base-log-group';

export interface StepFunctionsProps {
  namePrefix: string;
}

export class StepFunctions extends Construct {
  public readonly stateMachine: StateMachine;

  constructor(scope: Construct, id: string, props: StepFunctionsProps) {
    super(scope, id);

    const { namePrefix } = props;

    // SQSのメッセージを受けるLambdaの作成
    const eventBridgeLambda = new EventBridgeLambda(this, 'Lambda', {
      namePrefix: namePrefix,
    });

    // Step Functionsのロールを作成
    const role = this.createStateMachineRole(
      namePrefix,
      eventBridgeLambda.receiveSqsMessageFunction,
    );

    // Step FunctionsのLogGroupの作成
    const logGroup = this.createStateMachineLogGroup(namePrefix);

    // Step FunctionsのState作成
    this.stateMachine = this.createStateMachine(
      namePrefix,
      eventBridgeLambda.receiveSqsMessageFunction,
      role,
      logGroup,
    );
  }

  private createStateMachineRole(
    namePrefix: string,
    receiveSqsMessageFunction: NodejsFunction,
  ): IRole {
    const role = new Role(this, 'Role', {
      roleName: `${namePrefix}-state-machine-role`,
      assumedBy: new ServicePrincipal('states.amazonaws.com'),
      managedPolicies: [
        {
          managedPolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaRole',
        },
      ],
      inlinePolicies: {
        StepFunctionsPolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ['lambda:InvokeFunction'],
              resources: [
                receiveSqsMessageFunction.functionArn,
                `${receiveSqsMessageFunction.functionArn}:*`,
              ],
            }),
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: [
                'logs:CreateLogDelivery',
                'logs:CreateLogStream',
                'logs:GetLogDelivery',
                'logs:UpdateLogDelivery',
                'logs:DeleteLogDelivery',
                'logs:ListLogDeliveries',
                'logs:PutLogEvents',
                'logs:PutResourcePolicy',
                'logs:DescribeResourcePolicies',
                'logs:DescribeLogGroups',
              ],
              resources: ['*'],
            }),
          ],
        }),
      },
    });

    return role.withoutPolicyUpdates();
  }

  private createStateMachineLogGroup(namePrefix: string): LogGroup {
    return new BaseLogGroup(this, 'LogGroup', {
      logGroupName: `/aws/states/${namePrefix}-state-machine`,
    });
  }

  private createStateMachine(
    namePrefix: string,
    receiveSqsMessageFunction: NodejsFunction,
    role: IRole,
    logGroup: LogGroup,
  ): StateMachine {
    const startJob = new LambdaInvoke(this, 'ReceiveSqsMessageLambdaInvoke', {
      lambdaFunction: receiveSqsMessageFunction,
      outputPath: '$.Payload',
    });

    const waitX = new Wait(this, 'WaitXSeconds', {
      time: WaitTime.secondsPath('$.waitSeconds'),
    });

    const definition = startJob.next(waitX).next(new Succeed(this, 'Succeed'));

    return new StateMachine(this, 'StateMachine', {
      stateMachineName: `${namePrefix}-state-machine`,
      definitionBody: DefinitionBody.fromChainable(definition),
      timeout: Duration.minutes(5),
      comment: 'learn SQS & EventBridge Pipes state machine',
      role: role,
      logs: {
        destination: logGroup,
        includeExecutionData: true,
        level: LogLevel.ALL,
      },
    });
  }
}
