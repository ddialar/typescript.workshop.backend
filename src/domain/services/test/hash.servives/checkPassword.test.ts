import { testingValidHashedPassword } from '@testingFixtures'
import { checkPassword } from '@domainServices'

describe('[SERVICES] Hash - checkPassword', () => {
  const hashedPassword = testingValidHashedPassword

  it('must return TRUE if the provided password and the hashed one are equivalent', async (done) => {
    const plainPassword = '123456'

    expect((await checkPassword(plainPassword, hashedPassword))).toBeTruthy()

    done()
  })

  it('must return FALSE if the provided password and the hashed one are NOT equivalent', async (done) => {
    const plainPassword = 'wr0ngp4$$w0rd'

    expect((await checkPassword(plainPassword, hashedPassword))).toBeFalsy()

    done()
  })
})
