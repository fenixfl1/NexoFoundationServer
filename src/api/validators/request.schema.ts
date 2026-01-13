import Joi from 'joi'
import { RequestStatus } from '@src/entity/Request'

export const createRequestSchema = Joi.object({
  PERSON_ID: Joi.number().integer().required(),
  STUDENT_ID: Joi.number().integer().optional().allow(null),
  REQUEST_TYPE: Joi.string().max(100).required(),
  STATUS: Joi.string()
    .valid(...Object.values(RequestStatus))
    .default(RequestStatus.PENDING),
  ASSIGNED_COORDINATOR: Joi.string().max(150).optional().allow(null, ''),
  NEXT_APPOINTMENT: Joi.date().iso().optional().allow(null),
  COHORT: Joi.string().max(100).optional().allow(null, ''),
  NOTES: Joi.string().optional().allow(null, ''),
})

export const updateRequestSchema = createRequestSchema.keys({
  REQUEST_ID: Joi.number().integer().required(),
})
