import { google } from 'googleapis'
import SMTPTransport from 'nodemailer/lib/smtp-transport'

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
)

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })

export async function getEmailConfig(): Promise<SMTPTransport.Options> {
  const accessToken = await oAuth2Client.getAccessToken()

  return {
    host: process.env.SMTP_HOST,
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: process.env.NODEMAILER_USER,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken.token ?? '',
    },
  }
}
