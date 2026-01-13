import Joi from 'joi'

export const createRequirementSchema = Joi.object({
  REQUIREMENT_KEY: Joi.string().max(100).required(),
  NAME: Joi.string().max(150).required(),
  DESCRIPTION: Joi.string().allow('', null).optional(),
  IS_REQUIRED: Joi.boolean().optional(),
  STATE: Joi.string().valid('A', 'I').optional(),
})

export const updateRequirementSchema = createRequirementSchema.keys({
  REQUIREMENT_ID: Joi.number().integer().required(),
})
