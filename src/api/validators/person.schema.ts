import Joi from 'joi'
import { ScholarshipStatus } from '@src/entity/Student'

const referenceSchema = Joi.object({
  FULL_NAME: Joi.string().required(),
  RELATIONSHIP: Joi.string().required(),
  PHONE: Joi.string().required(),
  EMAIL: Joi.string().email().optional(),
  ADDRESS: Joi.string().optional().allow('', null),
  NOTES: Joi.string().optional().allow('', null),
})

const studentPayloadSchema = Joi.object({
  UNIVERSITY: Joi.string().max(150).required(),
  CAREER: Joi.string().max(150).required(),
  SCHOLARSHIP_STATUS: Joi.string()
    .valid(...Object.values(ScholarshipStatus))
    .default(ScholarshipStatus.PENDING),
  ACADEMIC_AVERAGE: Joi.number().min(0).max(4).default(0),
  HOURS_REQUIRED: Joi.number().integer().min(0).default(0),
  HOURS_COMPLETED: Joi.number().integer().min(0).default(0),
  LAST_FOLLOW_UP: Joi.date().iso().optional(),
  NEXT_APPOINTMENT: Joi.date().iso().optional(),
  COHORT: Joi.string().max(100).optional().allow('', null),
  CAMPUS: Joi.string().max(150).optional().allow('', null),
  SCORE: Joi.number().integer().min(0).max(100).optional().allow(null),
})

export const createPersonSchema = Joi.object({
  USERNAME: Joi.string().optional(),
  PASSWORD: Joi.string().optional(),
  NAME: Joi.string().required(),
  LAST_NAME: Joi.string().optional(),
  GENDER: Joi.string().valid('M', 'F').optional(),
  BIRTH_DATE: Joi.date().iso().required(),
  DOCUMENT_TYPE: Joi.string().max(50).optional().allow('', null),
  IDENTITY_DOCUMENT: Joi.string().required(),
  ROLE_ID: Joi.number().integer().required(),
  INCOMPLETE: Joi.boolean().optional().default(false),
  REFERENCES: Joi.array().items(referenceSchema).optional().default([]),
  PERSON_TYPE: Joi.string().required(),
  DOCUMENTS: Joi.array()
    .items(
      Joi.object({
        DOCUMENT_TYPE: Joi.string().max(100).required(),
        FILE_NAME: Joi.string().max(255).required(),
        MIME_TYPE: Joi.string().max(100).required(),
        FILE_BASE64: Joi.string().required(),
        SIGNED_BASE64: Joi.string().allow('', null).optional(),
        SIGNED_AT: Joi.date().allow(null).optional(),
        DESCRIPTION: Joi.string().allow('', null).optional(),
        STATE: Joi.string().valid('A', 'I').optional(),
      })
    )
    .optional()
    .default([]),
  CONTACTS: Joi.array()
    .items(
      Joi.object({
        TYPE: Joi.string()
          .valid('email', 'phone', 'whatsapp', 'other')
          .required(),
        USAGE: Joi.string()
          .valid('personal', 'institutional', 'emergency')
          .required(),
        VALUE: Joi.string().required(),
        IS_PRIMARY: Joi.boolean().required(),
      })
    )
    .optional()
    .default([]),
  STUDENT: studentPayloadSchema.when('ROLE_ID', {
    is: 3,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
})

export const updatePersonSchema = Joi.object({
  PERSON_ID: Joi.number().required(),
  PASSWORD: Joi.string().optional(),
  NAME: Joi.string().optional(),
  LAST_NAME: Joi.string().optional(),
  GENDER: Joi.string().valid('M', 'F').optional(),
  BIRTH_DATE: Joi.date().iso().optional(),
  DOCUMENT_TYPE: Joi.string().max(50).optional().allow('', null),
  IDENTITY_DOCUMENT: Joi.string().optional(),
  ROLE_ID: Joi.number().integer().optional(),
  STATE: Joi.string().valid('A', 'I').optional(),
  PERSON_TYPE: Joi.string().optional(),
})

export const createPersonReferencesSchema = Joi.object({
  PERSON_ID: Joi.number().required(),
  FULL_NAME: Joi.string().required(),
  RELATIONSHIP: Joi.string().required(),
  PHONE: Joi.string().required(),
  EMAIL: Joi.string().email().optional(),
  ADDRESS: Joi.string().optional().allow('', null),
  NOTES: Joi.string().optional().allow('', null),
})

export const updatePersonReferenceSchema = Joi.object({
  REFERENCE_ID: Joi.number().required(),
  PERSON_ID: Joi.number().optional(),
  FULL_NAME: Joi.string().optional(),
  RELATIONSHIP: Joi.string().optional(),
  PHONE: Joi.string().optional(),
  EMAIL: Joi.string().email().optional().allow(null, ''),
  ADDRESS: Joi.string().optional().allow('', null),
  NOTES: Joi.string().optional().allow('', null),
})
