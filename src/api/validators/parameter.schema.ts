import Joi from 'joi'

export const createParameterSchema = Joi.object({
  PARAMETER: Joi.string().max(150).required(),
  DESCRIPTION: Joi.string().max(255).allow('', null).optional(),
  VALUE: Joi.string().allow('', null).optional(),
  MENU_OPTION_ID: Joi.string().max(50).required(),
  STATE: Joi.string().valid('A', 'I').optional(),
})

export const updateParameterSchema = createParameterSchema.keys({
  PARAMETER_ID: Joi.number().integer().required(),
})
