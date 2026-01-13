import Joi from 'joi'

const channels = ['email', 'sms', 'in_app', 'push', 'whatsapp']

export const createNotificationTemplateSchema = Joi.object({
  TEMPLATE_KEY: Joi.string().max(150).required(),
  NAME: Joi.string().max(150).required(),
  DESCRIPTION: Joi.string().allow('', null).optional(),
  CHANNEL: Joi.string()
    .valid(...channels)
    .required(),
  SUBJECT: Joi.string().max(255).allow('', null).optional(),
  BODY: Joi.string().required(),
  PARAMETERS: Joi.object().unknown(true).allow(null).optional(),
  DEFAULTS: Joi.object().unknown(true).allow(null).optional(),
  MENU_OPTION_ID: Joi.string().max(50).allow('', null).optional(),
  STATE: Joi.string().valid('A', 'I').optional(),
})

export const updateNotificationTemplateSchema =
  createNotificationTemplateSchema.keys({
    TEMPLATE_ID: Joi.number().integer().required(),
  })
