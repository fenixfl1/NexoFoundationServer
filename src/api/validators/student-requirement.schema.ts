import Joi from 'joi'

export const createStudentRequirementSchema = Joi.object({
  STUDENT_ID: Joi.number().integer().required(),
  REQUIREMENT_ID: Joi.number().integer().required(),
  STATUS: Joi.string().valid('P', 'R', 'A', 'D').optional(),
  OBSERVATION: Joi.string().allow('', null).optional(),
  VALIDATED_BY: Joi.number().integer().allow(null).optional(),
  VALIDATED_AT: Joi.date().allow(null).optional(),
  STATE: Joi.string().valid('A', 'I').optional(),
})

export const updateStudentRequirementSchema =
  createStudentRequirementSchema.keys({
    STUDENT_REQUIREMENT_ID: Joi.number().integer().required(),
  })
