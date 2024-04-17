#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LearnSqsLambdaTrigger } from '../lib/learn-sqs-lambda-trigger';
import { LearnSqs } from '../lib/learn-sqs';
import { LearnSqsEventPipeState } from '../lib/learn-sqs-event-pipe-state';
import { EnvValues } from '../lib/env/env-values';
import { setRemovalPolicy } from '../lib/aspect/remove-policy-setter';
import { addCommonTags } from '../lib/aspect/common-tag-setter';
import { LearnSqsS3LambdaStack } from '../lib/learn-sqs-s3-lambda';

const app = new cdk.App();

const projectName = app.node.tryGetContext('projectName');
const envKey = app.node.tryGetContext('environment');
const envValues: EnvValues = app.node.tryGetContext(envKey);
let namePrefix = `${projectName}-${envValues.env}`;

// SQS
const stack = new LearnSqs(app, namePrefix, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-northeast-1',
  },
  namePrefix,
  envValues,
});
setRemovalPolicy(stack, cdk.RemovalPolicy.DESTROY);
addCommonTags(stack, { project: projectName, env: envValues.env });

// SQS Lambda Trigger
namePrefix = `${projectName}-lambda-trigger-${envValues.env}`;
const lambdaTriggerStack = new LearnSqsLambdaTrigger(app, namePrefix, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-northeast-1',
  },
  namePrefix,
  envValues,
});
setRemovalPolicy(lambdaTriggerStack, cdk.RemovalPolicy.DESTROY);
addCommonTags(lambdaTriggerStack, { project: projectName, env: envValues.env });

// SQS Event Pipe State
namePrefix = `${projectName}-event-pipe-state-${envValues.env}`;
const eventPipeStateStack = new LearnSqsEventPipeState(app, namePrefix, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-northeast-1',
  },
  namePrefix,
  envValues,
});
setRemovalPolicy(eventPipeStateStack, cdk.RemovalPolicy.DESTROY);
addCommonTags(eventPipeStateStack, { project: projectName, env: envValues.env });

// S3 > SQS > Lambda
namePrefix = `${projectName}-s3-sqs-lambda-${envValues.env}`;
const s3SqsLambdaStack = new LearnSqsS3LambdaStack(app, namePrefix, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'ap-northeast-1',
  },
  namePrefix,
  envValues,
});
setRemovalPolicy(s3SqsLambdaStack, cdk.RemovalPolicy.DESTROY);
addCommonTags(s3SqsLambdaStack, { project: projectName, env: envValues.env });
