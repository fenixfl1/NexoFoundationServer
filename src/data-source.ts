import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { config } from 'dotenv'
import * as Entities from './entity'
import * as Migrations from './migrations'
import * as Subscribers from './subscribers'

config({ debug: false, quiet: true })

const entities = Object.values(Entities)
const migrations = Object.values(Migrations)
const subscribers = Object.values(Subscribers)
const databaseUrl = process.env.DATABASE_URL?.trim()
const hasHostConfig = Boolean(process.env.DB_HOST && process.env.DB_NAME)

console.log(databaseUrl)

export const AppDataSource = new DataSource({
  type: 'postgres',
  ...(databaseUrl
    ? { url: databaseUrl }
    : {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
      }),
  synchronize: false,
  logging: false,
  entities: entities as never,
  migrations,
  subscribers,
})
