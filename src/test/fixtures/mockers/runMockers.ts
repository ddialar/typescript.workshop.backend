import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'
// import { createdMokedAuthentication } from './testingAuthenticationMockFactory'
import { createMockedUsers } from './testingUserMockFactory'
import { createMockedPosts } from './testingPostMockFactory'
import { MockedPosts } from '../types'
import { UserDomainModel } from '@domainModels'

config({ path: path.join(__dirname, '../../../../env/.env.test') })

const saveFile = async (fileName: string, data: string) => {
  const filePath = path.join(__dirname, '../assets', fileName)

  console.log(`[DEBUG] Creating '${fileName}' file...`)
  fs.writeFile(filePath, data, (error) => {
    if (error) { console.error(`[ERROR] Creating '${fileName}' file. ${error.message}`) }
    console.log(`[INFO ] '${fileName}' file succesfully created.`)
  })
}

// Uncomment this lines when you need to generage new authentication credentials.
// const rawAuthentication: AuthenticationFixture = createdMokedAuthentication()
// saveFile('authentication.json', JSON.stringify(rawAuthentication))

const rawUsers: UserDomainModel[] = createMockedUsers(305)
saveFile('users.json', JSON.stringify(rawUsers))

const rawPosts: MockedPosts = createMockedPosts(rawUsers)
saveFile('posts.json', JSON.stringify(rawPosts))
