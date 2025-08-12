import amqp from 'amqplib'
import EmailService from './email.service'

const QUEUE_NAME = 'email_queue'

export async function startConsumer() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL ?? '')
  const channel = await connection.createChannel()

  await channel.assertQueue(QUEUE_NAME)

  const emailService = new EmailService()

  channel.consume(QUEUE_NAME, async (msg) => {
    if (msg) {
      try {
        const data = JSON.parse(msg.content.toString())

        await emailService.send(data)
        channel.ack(msg)
      } catch (err) {
        console.error(' ❌ Error procesando el mensaje:', err.message)
      }
    }
  })
}
