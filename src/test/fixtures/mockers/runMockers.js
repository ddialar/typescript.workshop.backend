const fs = require('fs')
const path = require('path')
const { config } = require('dotenv')
// const { createdMokedAuthentication } = require('./testingAuthenticationMockFactory')
const { createMockedUsers } = require('./testingUserMockFactory')
const { createMockedPosts } = require('./testingPostMockFactory')

config({ path: path.join(__dirname, '../../../../env/.env.test') })

const saveFile = async (fileName, data) => {
  const filePath = path.join(__dirname, '../assets', fileName)

  console.log(`[DEBUG] Creating '${fileName}' file...`)
  fs.writeFile(filePath, data, (error) => {
    if (error) { console.error(`[ERROR] Creating '${fileName}' file. ${error.message}`) }
    console.log(`[INFO ] '${fileName}' file succesfully created.`)
  })
}

// Uncomment this lines when you need to generage new authentication credentials.
// const rawAuthentication = createdMokedAuthentication()
// saveFile('authentication.json', JSON.stringify(rawAuthentication))

const rawUsers = createMockedUsers(305)
saveFile('users.json', JSON.stringify(rawUsers))

const rawPosts = createMockedPosts(rawUsers)
saveFile('posts.json', JSON.stringify(rawPosts))
