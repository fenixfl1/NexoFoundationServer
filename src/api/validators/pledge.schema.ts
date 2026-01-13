import Joi from 'joi'

export const createPledgeSchema = Joi.object({
  SPONSOR_ID: Joi.number().integer().required(),
  NAME: Joi.string().max(150).required(),
  DESCRIPTION: Joi.string().allow('', null).optional(),
  AMOUNT: Joi.number().positive().required(),
  START_DATE: Joi.date().required(),
  END_DATE: Joi.date().allow(null).optional(),
  FREQUENCY: Joi.string().max(30).allow('', null).optional(),
  STATUS: Joi.string().valid('P', 'A', 'C').optional(),
  NOTES: Joi.string().allow('', null).optional(),
  STATE: Joi.string().valid('A', 'I').optional(),
})

export const updatePledgeSchema = createPledgeSchema.keys({
  PLEDGE_ID: Joi.number().integer().required(),
})
