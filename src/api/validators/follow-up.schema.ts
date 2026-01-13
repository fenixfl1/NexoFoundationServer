import Joi from 'joi'

const statusValues = ['open', 'completed', 'cancelled']

export const createFollowUpSchema = Joi.object({
  STUDENT_ID: Joi.number().integer().required(),
  APPOINTMENT_ID: Joi.number().integer().allow(null).optional(),
  FOLLOW_UP_DATE: Joi.date().required(),
  SUMMARY: Joi.string().required(),
  NOTES: Joi.string().allow('', null).optional(),
  NEXT_APPOINTMENT: Joi.date().allow(null).optional(),
  STATUS: Joi.string()
    .valid(...statusValues)
    .optional(),
})

export const updateFollowUpSchema = createFollowUpSchema.keys({
  FOLLOW_UP_ID: Joi.number().integer().required(),
})
