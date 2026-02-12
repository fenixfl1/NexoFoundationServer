import Joi from 'joi'
import { ActivityStatus } from '@src/entity/Activity'
import { ParticipantStatus } from '@src/entity/ActivityParticipant'

export const createActivitySchema = Joi.object({
  TITLE: Joi.string().max(150).required(),
  DESCRIPTION: Joi.string().allow(null, '').optional(),
  START_AT: Joi.date().iso().required(),
  END_AT: Joi.date().iso().optional().allow(null),
  LOCATION: Joi.string().max(150).optional().allow(null, ''),
  HOURS: Joi.number().min(0).max(200).required(),
  CAPACITY: Joi.number().integer().min(1).optional().allow(null),
  STATUS: Joi.string()
    .valid(...Object.values(ActivityStatus))
    .default(ActivityStatus.PLANNED),
})

export const updateActivitySchema = createActivitySchema.keys({
  ACTIVITY_ID: Joi.number().integer().required(),
})

export const enrollActivitySchema = Joi.object({
  ACTIVITY_ID: Joi.number().integer().required(),
  STUDENT_ID: Joi.number().integer().required(),
})

export const updateParticipantSchema = Joi.object({
  PARTICIPANT_ID: Joi.number().integer().required(),
  STATUS: Joi.string()
    .valid(...Object.values(ParticipantStatus))
    .required(),
  HOURS_EARNED: Joi.number().min(0).max(200).optional(),
})
