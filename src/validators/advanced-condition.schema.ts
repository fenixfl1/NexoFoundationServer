import Joi from 'joi'

export const advancedConditionSchema = Joi.array().items(
  Joi.object({
    operator: Joi.string().required(),
    field: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ),
    value: Joi.alternatives()
      .try(
        Joi.string().allow(''),
        Joi.number(),
        Joi.boolean(),
        Joi.array().items(Joi.string(), Joi.number())
      )
      .required(),
  })
)
