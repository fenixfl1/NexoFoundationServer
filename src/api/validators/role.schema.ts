import Joi from 'joi'

export const createRoleSchema = Joi.object({
  NAME: Joi.string().required(),
  DESCRIPTION: Joi.string().optional(),
  PERMISSIONS: Joi.array<number>().min(1),
})

export const updateRoleSchema = Joi.object({
  NAME: Joi.string().optional(),
  DESCRIPTION: Joi.string().optional(),
  PERMISSIONS: Joi.array<number>().optional(),
  ROLE_ID: Joi.number().required(),
  STATE: Joi.string().optional(),
})
