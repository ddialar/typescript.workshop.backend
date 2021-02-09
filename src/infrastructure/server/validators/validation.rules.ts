import Joi from 'joi'

export const mongodbId = Joi.string().pattern(/^[a-zA-Z0-9]{24}$/)
export const body = Joi.string()
export const email = Joi.string().email({ minDomainSegments: 2, tlds: { allow: true } }).required()
export const url = Joi.string().uri({
  scheme: ['http', 'https'],
  domain: {
    minDomainSegments: 2,
    tlds: { allow: true }
  }
})

export const username = email
export const password = Joi.string().pattern(/^[a-zA-Z0-9]{4,}$/).required()
export const optionalName = Joi.string().min(2)
export const optionalSurname = optionalName
export const optionalAvatar = url
export const requiredName = Joi.string().min(2).required()
export const requiredSurname = requiredName
export const requiredAvatar = url.required()

export const token = Joi.string().pattern(/^[a-zA-Z0-9]+\.[a-zA-Z0-9]+\.[a-zA-Z0-9-_]+$/).required()

export const postId = mongodbId.required()

export const commentId = mongodbId.required()
export const commentBody = body.required()
