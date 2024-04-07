import { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {
  console.log('======================================================================');
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  console.log(`メッセージを受信しました。 ${event[0].body}`);
  console.log('======================================================================');
  return {
    waitSeconds: 10,
  };
};
