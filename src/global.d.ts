import { SessionInfo } from './types/api.types'

export {}

declare global {
  namespace Express {
    interface Request {
      sessionInfo: SessionInfo
    }
  }
  namespace NodeJS {
    interface ProcessEnv {
      APP_PORT: string
      JWT_SECRET: string
      DB_HOST: string
      DB_PORT: string
      DB_USERNAME: string
      DB_PASSWORD: string
      DB_NAME: string
      NODEMAILER_USER: string
      NODEMAILER_PASS: string
      SMTP_HOST: string
      CLIENT_ID: string
      CLIENT_SECRET: string
      REDIRECT_URI: string
      REFRESH_TOKEN: string
      RABBITMQ_URL: string
      ADMIN_APP_URL: string
      CLIENT_APP_URL: string
      SESSION_EXPIRATION_MAGNITUDE: string
      SESSION_EXPIRATION_TIME: string
      DATABASE_URL: string
    }
  }
}
