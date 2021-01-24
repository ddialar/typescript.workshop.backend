const { random } = require('faker')

const generateMockedMongoDbId = () => random.uuid().split('-').join('').slice(0, 24)

module.exports = { generateMockedMongoDbId }
