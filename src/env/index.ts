import { config } from 'dotenv'
import { z } from 'zod'

if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test' })
} else {
  config()
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('production'),
  DATABASE_URL: z.string(),
  PORT: z.number().default(3333),
})

export const envParsed = envSchema.safeParse(process.env)

if (envParsed.success === false) {
  console.error('⚠ Invalid enviroment variables!', envParsed.error.format())

  throw new Error('Invalid enviroment variables.')
}

export const env = envParsed.data
