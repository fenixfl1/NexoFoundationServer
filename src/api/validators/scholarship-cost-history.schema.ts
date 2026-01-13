import Joi from 'joi'

export const createScholarshipCostSchema = Joi.object({
  SCHOLARSHIP_ID: Joi.number().integer().required(),
  PERIOD_TYPE: Joi.string().valid('S', 'C', 'T').required(),
  PERIOD_LABEL: Joi.string().max(30).required(),
  PERIOD_START: Joi.date().required(),
  PERIOD_END: Joi.date().required(),
  AMOUNT: Joi.number().positive().required(),
  STATUS: Joi.string().valid('P', 'A', 'C').optional(),
  NOTES: Joi.string().allow('', null).optional(),
  STATE: Joi.string().valid('A', 'I').optional(),
})

export const updateScholarshipCostSchema = createScholarshipCostSchema.keys({
  COST_ID: Joi.number().integer().required(),
})
