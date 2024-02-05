import { Construct } from 'constructs'
import { IRole, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs'
import { Duration, RemovalPolicy } from 'aws-cdk-lib'

export interface LambdaProps {
  namePrefix: string
}

export class EventBridgeLambda extends Construct {
  public readonly receiveSqsMessageFunction: NodejsFunction

  constructor(scope: Construct, id: string, props: LambdaProps) {
    super(scope, id)

    const { namePrefix } = props

    const role = this.createEventBridgePipeLambdaRole(namePrefix)
    const func = this.createReceiveSqsMessageFunction(namePrefix, role)
    this.createReceiveSqsMessageFunctionLogGroup(func)

    this.receiveSqsMessageFunction = func
  }

  private createEventBridgePipeLambdaRole(namePrefix: string): IRole {
    return new Role(this, 'ReceiveSqsMessageLambdaRole', {
      roleName: `${namePrefix}ReceiveSqsMessageLambdaRole`,
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        {
          managedPolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
        },
      ],
    })
  }

  private createReceiveSqsMessageFunction(namePrefix: string, role: IRole): NodejsFunction {
    return new NodejsFunction(this, 'ReceiveSqsMessageLambda', {
      functionName: `${namePrefix}ReceiveSqsMessage`,
      entry: './lambda/receiveSqsMessageEventBridgePipes.ts',
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
