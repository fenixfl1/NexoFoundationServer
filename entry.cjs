// entry.cjs
const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

// Cargar .env desde el directorio del ejecutable (no del source)
const execDir = path.dirname(process.execPath)
const envPath = path.join(execDir, '.env')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
} else {
  // Fallback: si corres sin empaquetar, permite .env en cwd
  dotenv.config()
}

// Opcional: setea NODE_ENV si no viene
process.env.NODE_ENV = process.env.NODE_ENV || 'production'

// Ejecuta tu build compilado
require('./dist/src/index.js')
