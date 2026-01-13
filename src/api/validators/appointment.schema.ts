import Joi from 'joi'

const statusValues = ['scheduled', 'completed', 'cancelled']

export const createAppointmentSchema = Joi.object({
  PERSON_ID: Joi.number().integer().required(),
  REQUEST_ID: Joi.number().integer().allow(null).optional(),
  STUDENT_ID: Joi.number().integer().allow(null).optional(),
  TITLE: Joi.string().max(150).required(),
  DESCRIPTION: Joi.string().allow('', null).optional(),
  START_AT: Joi.date().required(),
  END_AT: Joi.date().allow(null).optional(),
  LOCATION: Joi.string().max(150).allow('', null).optional(),
  STATUS: Joi.string()
    .valid(...statusValues)
    .optional(),
  NOTES: Joi.string().max(255).allow('', null).optional(),
})

export const updateAppointmentSchema = createAppointmentSchema.keys({
  APPOINTMENT_ID: Joi.number().integer().required(),
})
