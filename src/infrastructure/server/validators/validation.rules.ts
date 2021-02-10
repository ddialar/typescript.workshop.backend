import Joi from 'joi'

export const username = Joi.string().email({ minDomainSegments: 2, tlds: { allow: true } }).required()
export const password = Joi.string().pattern(/^[a-zA-Z0-9]{4,}$/).required()
