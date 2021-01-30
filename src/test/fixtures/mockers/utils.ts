import { random } from 'faker'

export const generateMockedMongoDbId = () => random.uuid().split('-').join('').slice(0, 24)
