import alias from 'esbuild-plugin-alias'
import esbuild from 'esbuild'

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: ['node18'],
    outfile: 'build/app.cjs',
    format: 'esm',
    sourcemap: false,
    external: ['bcrypt'],
    plugins: [
      alias({
        '@src': './src',
        '@entity': './src/entity',
        '@constants': './src/constants',
        '@helpers': './src/helpers',
        '@validators': './src/validators',
      }),
    ],
    logLevel: 'info',
  })
  .catch(() => process.exit(1))
