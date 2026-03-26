import amqp from 'amqplib'
import EmailService from './email.service'

const QUEUE_NAME = 'email_queue'

export async function startConsumer() {
  const rabbitUrl = process.env.RABBITMQ_URL

  if (!rabbitUrl) {
    console.warn('⚠️  RabbitMQ no configurado. Se omite el consumer de correos.')
    return false
  }

  try {
    const connection = await amqp.connect(rabbitUrl)
    const channel = await connection.createChannel()

    await channel.assertQueue(QUEUE_NAME)

    const emailService = new EmailService()

    connection.on('error', (error) => {
      console.error('⚠️  Error en la conexión de RabbitMQ:', error.message)
    })

    connection.on('close', () => {
      console.warn('⚠️  La conexión de RabbitMQ fue cerrada.')
    })

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

    console.log('✅ RabbitMQ conectado. Consumer de correos iniciado.')
    return true
  } catch (error) {
    console.error(
      '⚠️  No se pudo conectar a RabbitMQ. El servidor seguirá sin consumer de correos.',
      error.message
    )
    return false
  }
}
