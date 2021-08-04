import bcrypt from 'bcrypt'

import { testingValidHashedPassword, testingValidPlainPassword, testingWrongPlainPassword } from '@testingFixtures'
import { checkPassword } from '@domainServices'
import { CheckingPasswordError } from '@errors'

describe('[SERVICES] Hash - checkPassword', () => {
  const hashedPassword = testingValidHashedPassword

  it('must return TRUE if the provided password and the hashed one are equivalent', async () => {
    const plainPassword = testingValidPlainPassword

    expect((await checkPassword(plainPassword, hashedPassword))).toBeTruthy()
  })

  it('must return FALSE if the provided password and the hashed one are NOT equivalent', async () => {
    const plainPassword = testingWrongPlainPassword

    expect((await checkPassword(plainPassword, hashedPassword))).toBeFalsy()
  })

  it('must throw an INTERNAL_SERVER_ERROR (500) when the bcrypt lib fails', async () => {
    jest.mock('bcrypt')

    const plainPassword = testingValidPlainPassword
    const errorMessage = 'Testing Error'
    const expectedError = new CheckingPasswordError(`Error checking password. ${errorMessage}`)

    bcrypt.compare = jest.fn().mockImplementationOnce(() => { throw expectedError })

    await expect(checkPassword(plainPassword, hashedPassword)).rejects.toThrowError(expectedError)

    jest.mock('bcrypt').resetAllMocks()
  })
})
