import supertest, { SuperTest, Test } from 'supertest'

import { server } from './server'

const HELLO_PATH = '/hello'

describe(`[GET] ${HELLO_PATH}`, () => {
  let request: SuperTest<Test>

  beforeAll(async () => {
    request = supertest(server)
  })

  it('must return an OK (200) and the defined greeting', async (done) => {
    await request
      .get(HELLO_PATH)
      .expect(200)
      .then(async ({ text }) => {
        expect(text).toBe('Welcome to the TS backend workshop!!!')
      })

    done()
  })
})
