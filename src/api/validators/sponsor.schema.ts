import Joi from 'joi'

export const createSponsorSchema = Joi.object({
  NAME: Joi.string().max(150).required(),
  TYPE: Joi.string().max(50).allow('', null).optional(),
  TAX_ID: Joi.string().max(30).allow('', null).optional(),
  CONTACT_NAME: Joi.string().max(150).allow('', null).optional(),
  CONTACT_EMAIL: Joi.string().email().max(150).allow('', null).optional(),
  CONTACT_PHONE: Joi.string().max(30).allow('', null).optional(),
  ADDRESS: Joi.string().allow('', null).optional(),
  NOTES: Joi.string().allow('', null).optional(),
  STATE: Joi.string().valid('A', 'I').optional(),
})

export const updateSponsorSchema = createSponsorSchema.keys({
  SPONSOR_ID: Joi.number().integer().required(),
})
