import Joi from 'joi'

export const createStaffSchema = Joi.object({
  NAME: Joi.string().required(),
  LAST_NAME: Joi.string().required(),
  EMAIL: Joi.string().email().required(),
  BIRTH_DATA: Joi.date().required(),
  PHONE: Joi.string().required(),
  GENDER: Joi.string().valid('M', 'F').required(),
  IDENTITY_DOCUMENT: Joi.string().length(11).required(),
  ADDRESS: Joi.string().required(),
  CREATED_AT: Joi.date().optional(),
  STATE: Joi.string().valid('A', 'I').optional(),
})
