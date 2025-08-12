
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from "url";

// Convierte import.meta.url a ruta de archivo
const __filename = fileURLToPath(import.meta.url);

// Obtiene el directorio que contiene el archivo
const __dirname = path.dirname(__filename);

// Ahora puedes usar __dirname normalmente
const distPath = path.join(__dirname, "dist");
console.log(distPath);


  if (fs.existsSync(distPath)) {
    fs.removeSync(distPath)
  }

  console.log('✅ Carpeta dist limpia')