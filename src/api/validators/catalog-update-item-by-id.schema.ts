import Joi from 'joi'

export const updateCatalogItemByIdParamsSchema = Joi.object({
  catalogId: Joi.number().integer().required(),
  itemId: Joi.number().integer().required(),
})

export const updateCatalogItemByIdSchema = Joi.object({
  VALUE: Joi.string().max(100).optional(),
  LABEL: Joi.string().max(200).optional(),
  ORDER: Joi.number().integer().min(0).optional(),
  EXTRA: Joi.object().unknown(true).allow(null).optional(),
  STATE: Joi.string().valid('A', 'I').optional(),
})
