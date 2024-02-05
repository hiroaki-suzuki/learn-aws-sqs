#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { LearnSqsLambdaTrigger } from '../lib/learn-sqs-lambda-trigger'
import { LearnSqs } from '../lib/learn-sqs'
import { LearnSqsEventPipeState } from '../lib/learn-sqs-event-pipe-state'

const app = new cdk.App()

new LearnSqs(app, 'LearnSqs', {})
new LearnSqsLambdaTrigger(app, 'LearnSqsLambdaTrigger', {})
new LearnSqsEventPipeState(app, 'LearnSqsEventPipeState', {})
