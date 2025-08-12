import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

// Convierte import.meta.url a ruta de archivo
const __filename = fileURLToPath(import.meta.url);

// Obtiene el directorio que contiene el archivo
const __dirname = path.dirname(__filename);

// Ruta del archivo que pkg necesita como entry
const entryPath = path.join(__dirname, "../dist", "index.js");
const realMainPath = path.join(__dirname, "../dist", "src", "index.js");

// eslint-disable-next-line no-console
console.log({realMainPath, __filename,
__dirname})

// Si el index principal está en dist/src, lo movemos
// if (fs.existsSync(realMainPath)) {
//   fs.moveSync(realMainPath, entryPath, { overwrite: true });
//   console.log("✅ index.js movido a dist/");
// } else {
//   console.warn("⚠ No se encontró el archivo dist/src/index.js");
// }
