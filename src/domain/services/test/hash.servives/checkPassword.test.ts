import { testingValidHashedPassword, testingValidPlainPassword, testingWrongPlainPassword } from '@testingFixtures'
import { checkPassword } from '@domainServices'

describe('[SERVICES] Hash - checkPassword', () => {
  const hashedPassword = testingValidHashedPassword

  it('must return TRUE if the provided password and the hashed one are equivalent', async (done) => {
    const plainPassword = testingValidPlainPassword

    expect((await checkPassword(plainPassword, hashedPassword))).toBeTruthy()

    done()
  })

  it('must return FALSE if the provided password and the hashed one are NOT equivalent', async (done) => {
    const plainPassword = testingWrongPlainPassword

    expect((await checkPassword(plainPassword, hashedPassword))).toBeFalsy()

    done()
  })
})
