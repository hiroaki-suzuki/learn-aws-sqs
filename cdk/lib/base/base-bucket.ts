import { Bucket, BucketProps } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { RemovalPolicy } from 'aws-cdk-lib';

export class BaseBucket extends Bucket {
  constructor(scope: Construct, id: string, props: BucketProps) {
    super(scope, id, {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      ...props,
    });
  }
}
