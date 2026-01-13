// import '@helpers/generate-index'
import express from 'express'
import cors from 'cors'
import http from 'http'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import { AppDataSource } from './data-source'
import { serverMessage } from '@helpers/server-message'
import routes from './api/routes'
import { errorHandler } from './api/middlewares/error.middleware'
import { startConsumer } from './api/services/email/email-consumer.service'
import { startNotificationDispatcher } from './jobs/notification-dispatcher'

const start = performance.now()

const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST',
  credentials: false,
}

async function init() {
  try {
    const app = express()

    app.use(cors(corsOptions))
    app.use(cookieParser())
    app.use(bodyParser.json({ limit: '50mb' }))
    app.use(express.urlencoded({ extended: true }))
    app.use(routes)
    app.use(errorHandler)

    await AppDataSource.initialize()

    const server = http.createServer(app)

    server.listen(process.env.APP_PORT)

    serverMessage(`${(performance.now() - start).toFixed(2)} ms`)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(' 💥 Something went wrong: ', error)
  }
}

init().then(async () => {
  await startConsumer()
  startNotificationDispatcher()
})
