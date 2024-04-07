import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs/lib/function';
import { Duration } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { BaseLogGroup } from './base-log-group';

export class BaseNodejsFunction extends NodejsFunction {
  constructor(scope: Construct, id: string, props: NodejsFunctionProps) {
    super(scope, id, {
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(30),
      ...props,
    });

    // Lambda関数のロググループを作成
    this.createLogGroup();
  }

  private createLogGroup(): void {
    new BaseLogGroup(this, `${this.node.id}LogGroup`, {
      logGroupName: `/aws/lambda/${this.functionName}`,
    });
  }
}
