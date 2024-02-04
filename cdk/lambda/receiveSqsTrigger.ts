import { Handler } from 'aws-lambda'

export const handler: Handler = async (event, context) => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2))
  console.log(`メッセージを受信しました。 ${event.Records[0].body}`)
  return context.logStreamName
}
