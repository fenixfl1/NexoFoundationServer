import fs from 'fs'
import path from 'path'

const folders = ['src/entity', 'src/migrations', 'src/subscribers']

function generateIndex(folderPath: string) {
  const absPath = path.resolve(folderPath)
  const files = fs
    .readdirSync(absPath)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts')

  const exports = files
    .map((f) => {
      const name = path.basename(f, '.ts')
      return `export * from './${name}'`
    })
    .join('\n')

  const indexPath = path.join(absPath, 'index.ts')
  fs.writeFileSync(indexPath, exports + '\n', 'utf-8')

  console.log(`Generated index.ts for ${folderPath}`)
}

folders.forEach(generateIndex)
