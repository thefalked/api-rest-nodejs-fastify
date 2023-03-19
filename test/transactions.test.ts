import { execSync } from 'node:child_process'
import { describe, it, beforeAll, afterAll, expect, beforeEach } from 'vitest'
import request from 'supertest'

import { app } from '../src/app'

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })
      .expect(201)
  })

  it('should be able to list all transactions', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTransactionsResponse.body).toEqual(
      expect.objectContaining({
        transactions: [
          expect.objectContaining({
            id: expect.any(String),
            title: expect.any(String),
            amount: expect.any(Number),
          }),
        ],
      }),
    )
  })

  it('should be able to get a specific transaction', async () => {
    const createTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: 5000,
        type: 'credit',
      })

    const cookies = createTransactionResponse.get('Set-Cookie')

    const listTransactionsResponse = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200)

    const transactionId = listTransactionsResponse.body.transactions[0].id

    const getTransactionResponse = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTransactionResponse.body).toEqual(
      expect.objectContaining({
        transaction: expect.objectContaining({
          id: expect.any(String),
          title: expect.any(String),
          amount: expect.any(Number),
        }),
      }),
    )
  })

  it('should be able to get the summary', async () => {
    const CREDIT_AMOUNT = 5000
    const DEBIT_AMOUNT = 1000

    const SUMMARY_AMOUNT = CREDIT_AMOUNT - DEBIT_AMOUNT

    const createCreditTransactionResponse = await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: CREDIT_AMOUNT,
        type: 'credit',
      })

    const cookies = createCreditTransactionResponse.get('Set-Cookie')

    await request(app.server)
      .post('/transactions')
      .send({
        title: 'New transaction',
        amount: DEBIT_AMOUNT,
        type: 'debit',
      })
      .set('Cookie', cookies)

    const summaryTransactionsResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200)

    expect(summaryTransactionsResponse.body).toEqual(
      expect.objectContaining({
        summary: expect.objectContaining({
          amount: SUMMARY_AMOUNT,
        }),
      }),
    )
  })
})
