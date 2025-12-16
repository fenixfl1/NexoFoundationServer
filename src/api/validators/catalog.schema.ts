import Joi from 'joi'

const keyRule = Joi.string()
  .pattern(/^[a-zA-Z0-9_-]+$/)
  .min(2)
  .max(100)
  .required()

export const createCatalogItemSchema = Joi.object({
  VALUE: Joi.string().max(100).required(),
  LABEL: Joi.string().max(200).required(),
  ORDER: Joi.number().integer().min(0).default(0),
  EXTRA: Joi.object().unknown(true).allow(null).optional(),
  STATE: Joi.string().valid('A', 'I').optional().default('A'),
})

export const createCatalogSchema = Joi.object({
  NAME: Joi.string().max(150).required(),
  KEY: keyRule,
  DESCRIPTION: Joi.string().max(255).allow('', null).optional(),
  ITEMS: Joi.array().items(createCatalogItemSchema),
})

export const updateCatalogSchema = Joi.object().keys({
  NAME: Joi.string().max(150).optional(),
  KEY: keyRule,
  DESCRIPTION: Joi.string().max(255).allow('', null).optional(),
  CATALOG_ID: Joi.number().integer().required(),
  STATE: Joi.string().valid('A', 'I').optional(),
})

export const getCatalogItemsParamsSchema = Joi.object({
  key: keyRule,
})

export const updateCatalogItemSchema = createCatalogItemSchema.keys({
  ITEM_ID: Joi.number().integer().required(),
})

export const getCatalogListSchema = Joi.object().pattern(
  Joi.string().required(),
  Joi.alternatives(Joi.string(), Joi.number())
)
