import { datatype } from 'faker'

export const generateMockedMongoDbId = () => datatype.uuid().split('-').join('').slice(0, 24)
