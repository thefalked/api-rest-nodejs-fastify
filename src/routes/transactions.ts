import crypto from 'node:crypto'
import { z } from 'zod'
import { FastifyInstance } from 'fastify'

import { knex } from '../database'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await knex('transactions').select('*')

    return transactions
  })

  app.post('/', async (req, reply) => {
    const createTransactionsBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionsBodySchema.parse(req.body)

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : 0 - amount,
    })

    return reply.status(201).send()
  })
}
