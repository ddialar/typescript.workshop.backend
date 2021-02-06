import Joi from 'joi'

const token = Joi.string().pattern(/^[a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9-_]+$/).required()

const schema = Joi.object({ token })

export const validateToken = (token: string | undefined) => {
  const { error } = schema.validate({ token })

  return {
    error: error && error.details[0].message
  }
}
