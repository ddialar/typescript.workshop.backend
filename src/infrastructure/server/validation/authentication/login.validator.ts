import Joi from 'joi'

const username = Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com'] } }).required()
const password = Joi.string().pattern(/^[a-zA-Z0-9]{4,}$/).required()

const schema = Joi.object({ username, password })

export const validateLoginParams = ({ username, password }: any) => {
  const { error } = schema.validate({ username, password })

  return {
    error: error && error.details[0].message
  }
}
