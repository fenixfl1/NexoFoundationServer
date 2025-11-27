import Joi from 'joi'
import { ScholarshipStatus } from '@src/entity/Student'

export const createStudentSchema = Joi.object({
  PERSON_ID: Joi.number().integer().required(),
  UNIVERSITY: Joi.string().max(150).required(),
  CAREER: Joi.string().max(150).required(),
  SCHOLARSHIP_STATUS: Joi.string()
    .valid(...Object.values(ScholarshipStatus))
    .required(),
  ACADEMIC_AVERAGE: Joi.number().min(0).max(4).default(0),
  HOURS_REQUIRED: Joi.number().integer().min(0).default(0),
  HOURS_COMPLETED: Joi.number().integer().min(0).default(0),
  LAST_FOLLOW_UP: Joi.date().iso().optional(),
  NEXT_APPOINTMENT: Joi.date().iso().optional(),
  COHORT: Joi.string().max(100).optional().allow(null, ''),
  CAMPUS: Joi.string().max(150).optional().allow(null, ''),
  SCORE: Joi.number().integer().min(0).max(100).optional().allow(null),
})

export const updateStudentSchema = createStudentSchema.keys({
  STUDENT_ID: Joi.number().integer().required(),
  PERSON_ID: Joi.number().integer().optional(),
})
