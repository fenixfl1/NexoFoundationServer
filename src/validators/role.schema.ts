import Joi from 'joi'

export const createRoleSchema = Joi.object({
  NAME: Joi.string().required(),
  DESCRIPTION: Joi.string().optional(),
  PERMISSIONS: Joi.array<number>().min(1),
})
export const updateRoleSchema = Joi.object({})
