import { Construct } from 'constructs'
import {
  Effect,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { RemovalPolicy } from 'aws-cdk-lib'
import { CfnPipe } from 'aws-cdk-lib/aws-pipes'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { StateMachine } from 'aws-cdk-lib/aws-stepfunctions'

interface EventBridgePipeProps {
  namePrefix: string
  queue: Queue
  stateMachine: StateMachine
}

export class EventBridgePipe extends Construct {
  constructor(scope: Construct, id: string, props: EventBridgePipeProps) {
    super(scope, id)

    const { namePrefix, queue, stateMachine } = props

    // EventBridge Pipeのロールを作成
    const eventBridgePipeRole = this.createEventBridgePipeRole(namePrefix, queue, stateMachine)

    // EventBridge Pipeのロググループを作成
    const eventBridgePipeLogGroup = this.createEventBridgePipeLogGroup(namePrefix)

    // EventBridge Pipeの作成
    this.createSqsLambdaStatePipe(
      namePrefix,
      eventBridgePipeRole,
      eventBridgePipeLogGroup,
      queue,
      stateMachine,
    )
  }

  private createEventBridgePipeRole(
    namePrefix: string,
    queue: Queue,
    stateMachine: StateMachine,
  ): Role {
    return new Role(this, 'Role', {
      roleName: `${namePrefix}EventBridgePipeRole`,
      assumedBy: new ServicePrincipal('pipes.amazonaws.com'),
      inlinePolicies: {
        EventBridgePipePolicy: new PolicyDocument({
          statements: [
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ['sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes'],
              resources: [queue.queueArn],
            }),
            new PolicyStatement({
              effect: Effect.ALLOW,
              actions: ['states:StartExecution'],
              resources: [stateMachine.stateMachineArn],
            }),
          ],
        }),
      },
    })
  }

  private createEventBridgePipeLogGroup(namePrefix: string): LogGroup {
    return new LogGroup(this, 'LogGroup', {
      logGroupName: `/aws/pipes/${namePrefix}EventBridgePipe`,
      retention: RetentionDays.ONE_YEAR,
      removalPolicy: RemovalPolicy.DESTROY,
    })
  }

  private createSqsLambdaStatePipe(
    namePrefix: string,
    pipeRole: Role,
    pipeLogGroup: LogGroup,
    queue: Queue,
    stateMachine: StateMachine,
  ): CfnPipe {
    return new CfnPipe(this, 'SqsLambdaStatePipe', {
      name: `${namePrefix}SqsLambdaStatePipe`,
      roleArn: pipeRole.roleArn,
      source: queue.queueArn,
      sourceParameters: {
        sqsQueueParameters: {
          batchSize: 1,
        },
      },
      target: stateMachine.stateMachineArn,
      targetParameters: {
        stepFunctionStateMachineParameters: {
          invocationType: 'FIRE_AND_FORGET',
        },
      },
      logConfiguration: {
        level: 'INFO',
        cloudwatchLogsLogDestination: {
          logGroupArn: pipeLogGroup.logGroupArn,
        },
        includeExecutionData: ['ALL'],
      },
    })
  }
}
