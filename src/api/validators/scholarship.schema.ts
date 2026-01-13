import Joi from 'joi'

export const createScholarshipSchema = Joi.object({
  STUDENT_ID: Joi.number().integer().required(),
  REQUEST_ID: Joi.number().integer().allow(null).optional(),
  NAME: Joi.string().max(150).required(),
  DESCRIPTION: Joi.string().allow('', null).optional(),
  AMOUNT: Joi.number().positive().required(),
  START_DATE: Joi.date().required(),
  END_DATE: Joi.date().allow(null).optional(),
  PERIOD_TYPE: Joi.string().valid('S', 'C', 'T').optional(),
  STATUS: Joi.string().valid('P', 'A', 'S', 'C').optional(),
  STATE: Joi.string().valid('A', 'I').optional(),
})

export const updateScholarshipSchema = createScholarshipSchema.keys({
  SCHOLARSHIP_ID: Joi.number().integer().required(),
})
