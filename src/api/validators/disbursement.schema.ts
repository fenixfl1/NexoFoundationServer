import Joi from 'joi'

export const createDisbursementSchema = Joi.object({
  SCHOLARSHIP_ID: Joi.number().integer().required(),
  COST_ID: Joi.number().integer().allow(null).optional(),
  AMOUNT: Joi.number().positive().required(),
  DISBURSEMENT_DATE: Joi.date().required(),
  METHOD: Joi.string().max(50).allow('', null).optional(),
  REFERENCE: Joi.string().max(100).allow('', null).optional(),
  STATUS: Joi.string().valid('P', 'D', 'R').optional(),
  NOTES: Joi.string().allow('', null).optional(),
  STATE: Joi.string().valid('A', 'I').optional(),
})

export const updateDisbursementSchema = createDisbursementSchema.keys({
  DISBURSEMENT_ID: Joi.number().integer().required(),
})
