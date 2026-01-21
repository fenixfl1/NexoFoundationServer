import Joi from 'joi'

export const createSponsorSchema = Joi.object({
  PERSON_ID: Joi.number().integer().required(),
  NAME: Joi.string().max(150).allow('', null).optional(),
  TYPE: Joi.string().max(50).allow('', null).optional(),
  TAX_ID: Joi.string().max(30).allow('', null).optional(),
  STATE: Joi.string().valid('A', 'I').optional(),
})

export const updateSponsorSchema = createSponsorSchema.keys({
  SPONSOR_ID: Joi.number().integer().required(),
})
