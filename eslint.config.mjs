import next from 'eslint-config-next'

const config = [
  {
    // The NestJS app is linted from backend/ with its own config and tsconfig.
    // coverage/ is generated output — linting Istanbul's bundled report scripts
    // only ever produces warnings about code nobody wrote.
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'next-env.d.ts',
      'backend/**',
    ],
  },
  ...next,
]

export default config
