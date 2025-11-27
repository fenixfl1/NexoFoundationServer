import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { config } from 'dotenv'
import * as Entities from './entity'
import * as Migrations from './migrations'

config({ debug: false, quiet: true })

const entities = Object.values(Entities)
const migrations = Object.values(Migrations)

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: entities as never,
  migrations,
})
