import { convertKeysToLowercase } from '@src/helpers/keys-to-lower'
import nodemailer, { SentMessageInfo } from 'nodemailer'
import SMTPTransport from 'nodemailer/lib/smtp-transport'
import { getEmailConfig } from 'src/email-config'
import { compileTemplate } from 'src/helpers/email-helpers'
import { BaseService, CatchServiceError } from '../base.service'

export interface EmailProps {
  to: string
  subject: string
  text: string
  templateName: string
  record: Record<string, any>
}

class EmailService extends BaseService {
  @CatchServiceError()
  async send({
    record,
    subject,
    templateName,
    text,
    to,
  }: EmailProps): Promise<SMTPTransport.SentMessageInfo> {
    const emailConfig = await getEmailConfig()
    const transporter = nodemailer.createTransport(emailConfig)

    const html = await compileTemplate(
      templateName,
      convertKeysToLowercase(record)
    )

    const info = await transporter.sendMail({
      from: emailConfig?.auth?.user,
      to,
      subject,
      text,
      html,
    })

    return info
  }
}

export default EmailService
