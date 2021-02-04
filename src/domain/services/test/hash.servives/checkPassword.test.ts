import bcrypt from 'bcrypt'

import { testingValidHashedPassword, testingValidPlainPassword, testingWrongPlainPassword } from '@testingFixtures'
import { checkPassword } from '@domainServices'
import { CheckingPasswordError } from '@errors'

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

  it('must throw an INTERNAL_SERVER_ERROR (500) when the bcrypt lib fails', async (done) => {
    jest.mock('bcrypt')

    const plainPassword = testingValidPlainPassword
    const errorMessage = 'Testing Error'
    const expectedError = new CheckingPasswordError(`Error checking password. ${errorMessage}`)

    bcrypt.compare = jest.fn().mockImplementationOnce(() => { throw expectedError })

    await expect(checkPassword(plainPassword, hashedPassword)).rejects.toThrowError(expectedError)

    jest.mock('bcrypt').resetAllMocks()

    done()
  })
})
