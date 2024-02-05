import 'dotenv/config'
import { DeleteMessageCommand, ReceiveMessageCommand, SQSClient } from '@aws-sdk/client-sqs'
import { Message } from '@aws-sdk/client-sqs/dist-types/models/models_0'
import { queueUrl } from './utils'

const client = new SQSClient({ region: 'ap-northeast-1' })

async function receive() {
  const params = {
    QueueUrl: queueUrl,
  }
  const command = new ReceiveMessageCommand(params)
  const response = await client.send(command)

  if (response.Messages) {
    for (const message of response.Messages) {
      console.log(`次のメッセージは消費しました。 ${message.Body}`)
      await deleteMessage(message)
    }
  } else {
    console.log('メッセージはありません')
  }
}

async function deleteMessage(message: Message): Promise<void> {
  const params = {
    QueueUrl: queueUrl,
    ReceiptHandle: message.ReceiptHandle,
  }
  const command = new DeleteMessageCommand(params)
  const response = await client.send(command)
  console.log(response)
  console.log(`次のメッセージは削除しました。 ${message.Body}`)
}

receive()
  .then(() => {
    console.log('Done')
  })
  .catch(error => {
    console.error(error)
  })
