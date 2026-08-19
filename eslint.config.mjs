import next from 'eslint-config-next'

const config = [
  {
    // The NestJS app has its own lint setup and its own tsconfig.
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts', 'backend/**'],
  },
  ...next,
]

export default config
