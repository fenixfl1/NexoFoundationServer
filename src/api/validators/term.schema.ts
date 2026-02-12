import Joi from 'joi'
import { CourseResultStatus } from '@src/entity/CourseGrade'

const courseSchema = Joi.object({
  COURSE_NAME: Joi.string().max(150).required(),
  GRADE: Joi.number().min(0).max(100).required(),
  CREDITS: Joi.number().min(0).max(20).required(),
  STATUS: Joi.string()
    .valid(...Object.values(CourseResultStatus))
    .default(CourseResultStatus.IN_PROGRESS),
})

export const createTermSchema = Joi.object({
  STUDENT_ID: Joi.number().integer().optional(),
  PERIOD: Joi.string().max(20).required(),
  OBSERVATIONS: Joi.string().allow(null, '').optional(),
  CAPTURE_FILE_NAME: Joi.string().max(255).allow(null, '').optional(),
  CAPTURE_MIME_TYPE: Joi.string().max(100).allow(null, '').optional(),
  CAPTURE_BASE64: Joi.string().allow(null, '').optional(),
  COURSES: Joi.array().items(courseSchema).min(1).required(),
})

export const updateTermSchema = createTermSchema.keys({
  TERM_ID: Joi.number().integer().required(),
}).fork(['STUDENT_ID', 'PERIOD', 'COURSES'], (schema) => schema.optional())
