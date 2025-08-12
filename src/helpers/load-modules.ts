import fg from 'fast-glob'

export async function loadModules(pattern: string): Promise<any[]> {
  const paths = await fg(pattern)
  const modules = await Promise.all(
    paths.map(async (path) => {
      const mod = await import(path)
      // Si exportan entidad/migración como default o nombrada, ajusta aquí:
      return mod.default || Object.values(mod)[0]
    })
  )
  return modules
}
