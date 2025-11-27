import Joi from 'joi'

export const createPersonSchema = Joi.object({
  USERNAME: Joi.string().optional(),
  PASSWORD: Joi.string().optional(),
  NAME: Joi.string().required(),
  LAST_NAME: Joi.string().required(),
  GENDER: Joi.string().valid('M', 'F').required(),
  BIRTH_DATE: Joi.date().iso().required(),
  IDENTITY_DOCUMENT: Joi.string().required(),
  ROLE_ID: Joi.number().integer().required(),
  REFERENCES: Joi.array()
    .items(
      Joi.object({
        FULL_NAME: Joi.string().required(),
        RELATIONSHIP: Joi.string().required(),
        PHONE: Joi.string().required(),
        EMAIL: Joi.string().email().optional(),
        ADDRESS: Joi.string().optional().allow('', null),
        NOTES: Joi.string().optional().allow('', null),
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
})
