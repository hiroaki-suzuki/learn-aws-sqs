import 'dotenv/config';
import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';
import { queueUrl } from './utils';
import { randomInt } from 'node:crypto';

const client = new SQSClient({ region: 'ap-northeast-1' });

const params = {
  QueueUrl: queueUrl,
  MessageBody: `Hello World! ${randomInt(1000)}`,
};
const command = new SendMessageCommand(params);
client
  .send(command)
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error(error);
  });
