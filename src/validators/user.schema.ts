import Joi from 'joi'

export const createUserSchema = Joi.object({
  USERNAME: Joi.string().required(),
  PASSWORD: Joi.string().optional(),
  AVATAR: Joi.string().allow(null).optional(),
  PERSON_ID: Joi.number().required(),
})

export const changePasswordSchema = Joi.object({
  USERNAME: Joi.string().required(),
  OLD_PASSWORD: Joi.string().required(),
  NEW_PASSWORD: Joi.string().required(),
})

export const updateUserSchema = Joi.object({
  USERNAME: Joi.string().required(),
  USER_ID: Joi.number().required(),
  AVATAR: Joi.string().allow(null).optional(),
  STATE: Joi.string().optional(),
})
