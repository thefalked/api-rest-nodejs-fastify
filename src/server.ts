import crypto from 'node:crypto'
import fastify from 'fastify'

import { knex } from './database'
import { env } from './env'

const app = fastify()

app.get('/', async () => {
  const tables = await knex('transactions')
    .insert({
      id: crypto.randomUUID(),
      title: 'Transaction de teste',
      amount: 1000,
    })
    .returning('*')

  return tables
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log(`Listening on port ${env.PORT}`)
  })
