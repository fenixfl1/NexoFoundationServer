import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { config } from 'dotenv'
import { fileURLToPath } from 'url'
import { loadModules } from './helpers/load-modules'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isProduction = process.env.NODE_ENV === 'production'

const entities = await loadModules(
  path.join(__dirname, isProduction ? 'entity/**/*.js' : 'entity/**/*.ts')
)
const migrations = await loadModules(
  path.join(
    __dirname,
    isProduction ? 'migrations/**/*.js' : 'migrations/**/*.ts'
  )
)

config({ debug: true })

console.log(process.env.NODE_ENV)

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
  entities,
  migrations,
})

console.log({ entities: AppDataSource.entityMetadatas })
