import { compare } from 'bcrypt'
import { hashPassword } from '@domainServices'
import { testingValidPlainPassword } from '@testingFixtures'

describe('[SERVICES] Hash - hashPassword', () => {
  it('must return a valid hash of the provided password', async () => {
    const plainPassword = testingValidPlainPassword
    const hashedPassword = await hashPassword(plainPassword)

    expect(hashedPassword).toMatch(/^\$[$/.\w\d]{59}$/)
    expect((await compare(plainPassword, hashedPassword))).toBeTruthy()
  })
})
