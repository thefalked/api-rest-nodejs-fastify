import crypto from 'node:crypto'
import fastify from 'fastify'

import { knex } from './database'

const PORT = 3333

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
    port: PORT,
  })
  .then(() => {
    console.log(`Listening on port ${PORT}`)
  })
