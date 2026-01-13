import Joi from 'joi'

const channels = ['email', 'sms', 'in_app', 'push', 'whatsapp']
const statuses = ['P', 'C', 'S', 'F']

const sharedNotificationSchema = {
  TEMPLATE_ID: Joi.number().integer().allow(null).optional(),
  CHANNEL: Joi.string()
    .valid(...channels)
    .when('TEMPLATE_ID', {
      is: Joi.exist(),
      then: Joi.string()
        .valid(...channels)
        .optional(),
      otherwise: Joi.string()
        .valid(...channels)
        .required(),
    }),
  RECIPIENT: Joi.string().max(255),
  SUBJECT: Joi.string().max(255).allow('', null).optional(),
  BODY: Joi.string().allow('', null).optional(),
  PAYLOAD: Joi.object().unknown(true).allow(null).optional(),
  RELATED_ENTITY: Joi.string().max(100).allow('', null).optional(),
  RELATED_ID: Joi.string().max(100).allow('', null).optional(),
  SCHEDULED_AT: Joi.date().allow(null).optional(),
  STATUS: Joi.string()
    .valid(...statuses)
    .optional(),
  ERROR_MESSAGE: Joi.string().allow('', null).optional(),
  STATE: Joi.string().valid('A', 'I').optional(),
}

export const createNotificationSchema = Joi.object({
  ...sharedNotificationSchema,
  RECIPIENT: sharedNotificationSchema.RECIPIENT.required(),
})
  .or('TEMPLATE_ID', 'BODY')

export const updateNotificationSchema = Joi.object({
  ...sharedNotificationSchema,
  RECIPIENT: sharedNotificationSchema.RECIPIENT.optional(),
  NOTIFICATION_ID: Joi.number().integer().required(),
  SENT_AT: Joi.date().allow(null).optional(),
  SENT_BY: Joi.number().integer().allow(null).optional(),
}).or('TEMPLATE_ID', 'BODY')
