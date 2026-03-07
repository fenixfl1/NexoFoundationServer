import Joi from 'joi'

const reportFiltersSchema = Joi.object({
  DATE_FROM: Joi.date().iso().allow(null, '').optional(),
  DATE_TO: Joi.date().iso().allow(null, '').optional(),
  STATUS: Joi.alternatives()
    .try(Joi.string(), Joi.array().items(Joi.string()))
    .allow(null)
    .optional(),
  REQUEST_TYPE: Joi.string().allow('', null).optional(),
  UNIVERSITY: Joi.string().allow('', null).optional(),
  COHORT: Joi.string().allow('', null).optional(),
  PERIOD: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .allow('', null)
    .optional(),
}).unknown(true)

export const runReportSchema = Joi.object({
  filters: reportFiltersSchema.default({}),
})

export const exportReportSchema = runReportSchema.keys({
  format: Joi.string().valid('csv', 'xlsx', 'pdf', 'json').default('xlsx'),
})

