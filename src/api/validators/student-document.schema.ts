import Joi from 'joi'

export const createStudentDocumentSchema = Joi.object({
  STUDENT_ID: Joi.number().integer().required(),
  DOCUMENT_TYPE: Joi.string().max(100).required(),
  FILE_NAME: Joi.string().max(255).required(),
  MIME_TYPE: Joi.string().max(100).required(),
  FILE_BASE64: Joi.string().required(),
  SIGNED_BASE64: Joi.string().allow('', null).optional(),
  SIGNED_AT: Joi.date().allow(null).optional(),
  DESCRIPTION: Joi.string().allow('', null).optional(),
  STATE: Joi.string().valid('A', 'I').optional(),
})

export const updateStudentDocumentSchema = createStudentDocumentSchema.keys({
  DOCUMENT_ID: Joi.number().integer().required(),
})
