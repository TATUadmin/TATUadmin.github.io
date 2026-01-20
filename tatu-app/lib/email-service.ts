import { Resend } from 'resend'
import { render } from '@react-email/render'
import { logger } from './monitoring'
import { ApiResponse, ErrorCodes, HttpStatus } from './api-response'

/**
 * Get the base URL for the application, ensuring it's properly formatted
 * Removes trailing slashes and ensures proper protocol
 */
function getBaseUrl(): string {
  const url = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  // Remove trailing slash if present
  return url.replace(/\/+$/, '')
}

// Email configuration
export interface EmailConfig {
  from: string
  replyTo?: string
  tags?: Array<{ name: string; value: string }>
  priority?: 'high' | 'normal' | 'low'
}

// Email template interface
export interface EmailTemplate {
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

// Email recipient interface
export interface EmailRecipient {
  email: string
  name?: string
  type?: 'to' | 'cc' | 'bcc'
}

// Email sending result
export interface EmailResult {
  id: string
  success: boolean
  error?: string
  recipient: string
  subject: string
  sentAt: string
}

// Email service class
export class EmailService {
  private static instance: EmailService
  private resend: Resend
  private config: EmailConfig

  constructor() {
    // Allow initialization during build time even if key is not set
    // Will throw error at runtime when actually sending emails
    // Use a dummy key during build to prevent Resend from throwing
    const apiKey = process.env.RESEND_API_KEY || 're_dummy_key_for_build_time_only'
    this.resend = new Resend(apiKey)
    this.config = {
      from: process.env.EMAIL_FROM || 'TATU <noreply@tatu.app>',
      replyTo: process.env.EMAIL_REPLY_TO || 'support@tatu.app',
      priority: 'normal'
    }
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  /**
   * Send a single email
   */
  async sendEmail(
    to: EmailRecipient | EmailRecipient[],
    template: EmailTemplate,
    config?: Partial<EmailConfig>
  ): Promise<EmailResult> {
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_dummy_key_for_build_time_only') {
      const errorMessage = 'RESEND_API_KEY is not set or invalid'
      logger.error('Email sending failed', {
        error: errorMessage,
        recipient: Array.isArray(to) ? to[0]?.email : to.email,
        subject: template.subject
      })
      
      return {
        id: 'failed',
        success: false,
        error: errorMessage,
        recipient: Array.isArray(to) ? to[0]?.email || 'unknown' : to.email,
        subject: template.subject,
        sentAt: new Date().toISOString()
      }
    }
    try {
      const recipients = Array.isArray(to) ? to : [to]
      const toEmails = recipients.filter(r => r.type !== 'cc' && r.type !== 'bcc')
      const ccEmails = recipients.filter(r => r.type === 'cc')
      const bccEmails = recipients.filter(r => r.type === 'bcc')

      if (toEmails.length === 0) {
        throw new Error('No valid recipients provided')
      }

      const emailConfig = { ...this.config, ...config }

      const emailData = {
        from: emailConfig.from,
        to: toEmails.map(r => r.name ? `${r.name} <${r.email}>` : r.email),
        cc: ccEmails.length > 0 ? ccEmails.map(r => r.name ? `${r.name} <${r.email}>` : r.email) : undefined,
        bcc: bccEmails.length > 0 ? bccEmails.map(r => r.name ? `${r.name} <${r.email}>` : r.email) : undefined,
        replyTo: emailConfig.replyTo,
        subject: template.subject,
        html: template.html,
        text: template.text,
        attachments: template.attachments,
        tags: emailConfig.tags
      }

      const result = await this.resend.emails.send(emailData)

      if (result.error) {
        // Log full error details for debugging
        console.error('Resend API Error:', JSON.stringify(result.error, null, 2))
        throw new Error(result.error.message || JSON.stringify(result.error))
      }

      const emailResult: EmailResult = {
        id: result.data?.id || 'unknown',
        success: true,
        recipient: toEmails[0].email,
        subject: template.subject,
        sentAt: new Date().toISOString()
      }

      logger.info('Email sent successfully', {
        emailId: emailResult.id,
        recipient: emailResult.recipient,
        subject: emailResult.subject
      })

      return emailResult

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Log full error details for debugging
      console.error('Email sending error details:', {
        error: errorMessage,
        errorObject: error,
        recipient: Array.isArray(to) ? to[0]?.email : to.email,
        subject: template.subject,
        from: emailConfig.from
      })
      
      logger.error('Email sending failed', {
        error: errorMessage,
        recipient: Array.isArray(to) ? to[0]?.email : to.email,
        subject: template.subject
      })

      return {
        id: 'failed',
        success: false,
        error: errorMessage,
        recipient: Array.isArray(to) ? to[0]?.email || 'unknown' : to.email,
        subject: template.subject,
        sentAt: new Date().toISOString()
      }
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(
    recipients: EmailRecipient[],
    template: EmailTemplate,
    config?: Partial<EmailConfig>
  ): Promise<EmailResult[]> {
    const results: EmailResult[] = []

    // Process in batches to avoid rate limits
    const batchSize = 10
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)
      const batchPromises = batch.map(recipient => 
        this.sendEmail(recipient, template, config)
      )

      try {
        const batchResults = await Promise.all(batchPromises)
        results.push(...batchResults)
      } catch (error) {
        logger.error('Bulk email batch failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          batchStart: i,
          batchSize: batch.length
        })
      }

      // Add delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return results
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    email: string,
    name: string,
    verificationToken?: string
  ): Promise<EmailResult> {
    const template: EmailTemplate = {
      subject: 'Welcome to TATU!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to TATU, ${name}!</h1>
          <p>Thank you for joining our tattoo community. We're excited to have you on board!</p>
          ${verificationToken ? `
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${getBaseUrl()}/verify-email?token=${encodeURIComponent(verificationToken)}" 
               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Verify Email Address
            </a>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              ${getBaseUrl()}/verify-email?token=${encodeURIComponent(verificationToken)}
            </p>
          ` : ''}
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The TATU Team</p>
        </div>
      `,
      text: verificationToken 
        ? `Welcome to TATU, ${name}! Thank you for joining our tattoo community. Please verify your email by visiting: ${getBaseUrl()}/verify-email?token=${encodeURIComponent(verificationToken)}`
        : `Welcome to TATU, ${name}! Thank you for joining our tattoo community.`
    }

    return this.sendEmail(
      { email, name },
      template,
      { tags: [{ name: 'type', value: 'welcome' }] }
    )
  }

  /**
   * Send appointment confirmation email
   */
  async sendAppointmentConfirmation(
    email: string,
    name: string,
    appointmentDetails: {
      artistName: string
      date: string
      time: string
      service: string
      duration: number
      location?: string
    }
  ): Promise<EmailResult> {
    const template: EmailTemplate = {
      subject: 'Appointment Confirmed - TATU',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Appointment Confirmed!</h1>
          <p>Hi ${name},</p>
          <p>Your appointment has been confirmed. Here are the details:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Appointment Details</h3>
            <p><strong>Artist:</strong> ${appointmentDetails.artistName}</p>
            <p><strong>Date:</strong> ${appointmentDetails.date}</p>
            <p><strong>Time:</strong> ${appointmentDetails.time}</p>
            <p><strong>Service:</strong> ${appointmentDetails.service}</p>
            <p><strong>Duration:</strong> ${appointmentDetails.duration} minutes</p>
            ${appointmentDetails.location ? `<p><strong>Location:</strong> ${appointmentDetails.location}</p>` : ''}
          </div>
          <p>If you need to reschedule or cancel, please contact us at least 24 hours in advance.</p>
          <p>Best regards,<br>The TATU Team</p>
        </div>
      `,
      text: `Appointment Confirmed! Hi ${name}, your appointment with ${appointmentDetails.artistName} on ${appointmentDetails.date} at ${appointmentDetails.time} has been confirmed.`
    }

    return this.sendEmail(
      { email, name },
      template,
      { tags: [{ name: 'type', value: 'appointment_confirmation' }] }
    )
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetToken: string
  ): Promise<EmailResult> {
    const template: EmailTemplate = {
      subject: 'Reset Your Password - TATU',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Reset Your Password</h1>
          <p>Hi ${name},</p>
          <p>We received a request to reset your password. Click the link below to create a new password:</p>
          <a href="${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}" 
             style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <p>Best regards,<br>The TATU Team</p>
        </div>
      `,
      text: `Reset Your Password - Hi ${name}, click this link to reset your password: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`
    }

    return this.sendEmail(
      { email, name },
      template,
      { tags: [{ name: 'type', value: 'password_reset' }] }
    )
  }

  /**
   * Send artist invitation email
   */
  async sendArtistInvitationEmail(
    email: string,
    name: string,
    shopName: string,
    invitationToken: string
  ): Promise<EmailResult> {
    const template: EmailTemplate = {
      subject: `You're Invited to Join ${shopName} on TATU`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>You're Invited!</h1>
          <p>Hi ${name},</p>
          <p>You've been invited to join <strong>${shopName}</strong> as an artist on TATU.</p>
          <p>Click the link below to accept the invitation and set up your artist profile:</p>
          <a href="${process.env.NEXTAUTH_URL}/accept-invitation?token=${invitationToken}" 
             style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Accept Invitation
          </a>
          <p>This invitation will expire in 7 days.</p>
          <p>Best regards,<br>The TATU Team</p>
        </div>
      `,
      text: `You're Invited! Hi ${name}, you've been invited to join ${shopName} as an artist on TATU. Click this link to accept: ${process.env.NEXTAUTH_URL}/accept-invitation?token=${invitationToken}`
    }

    return this.sendEmail(
      { email, name },
      template,
      { tags: [{ name: 'type', value: 'artist_invitation' }] }
    )
  }

  /**
   * Send review request email
   */
  async sendReviewRequestEmail(
    email: string,
    name: string,
    artistName: string,
    appointmentDate: string,
    reviewToken: string
  ): Promise<EmailResult> {
    const template: EmailTemplate = {
      subject: 'How was your tattoo experience?',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>How was your tattoo experience?</h1>
          <p>Hi ${name},</p>
          <p>We hope you had a great experience with ${artistName} on ${appointmentDate}!</p>
          <p>Your feedback helps other customers make informed decisions. Please take a moment to leave a review:</p>
          <a href="${process.env.NEXTAUTH_URL}/review?token=${reviewToken}" 
             style="background-color: #ffc107; color: black; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Leave a Review
          </a>
          <p>Thank you for being part of the TATU community!</p>
          <p>Best regards,<br>The TATU Team</p>
        </div>
      `,
      text: `How was your tattoo experience? Hi ${name}, please leave a review for ${artistName}: ${process.env.NEXTAUTH_URL}/review?token=${reviewToken}`
    }

    return this.sendEmail(
      { email, name },
      template,
      { tags: [{ name: 'type', value: 'review_request' }] }
    )
  }

  /**
   * Send payment confirmation email
   */
  async sendPaymentConfirmationEmail(
    email: string,
    name: string,
    paymentDetails: {
      amount: number
      currency: string
      paymentMethod: string
      transactionId: string
      appointmentDate?: string
    }
  ): Promise<EmailResult> {
    const template: EmailTemplate = {
      subject: 'Payment Confirmed - TATU',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Payment Confirmed!</h1>
          <p>Hi ${name},</p>
          <p>Your payment has been successfully processed. Here are the details:</p>
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Payment Details</h3>
            <p><strong>Amount:</strong> ${paymentDetails.currency} ${paymentDetails.amount.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</p>
            <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
            ${paymentDetails.appointmentDate ? `<p><strong>Appointment Date:</strong> ${paymentDetails.appointmentDate}</p>` : ''}
          </div>
          <p>You can view your receipt in your account dashboard.</p>
          <p>Best regards,<br>The TATU Team</p>
        </div>
      `,
      text: `Payment Confirmed! Hi ${name}, your payment of ${paymentDetails.currency} ${paymentDetails.amount.toFixed(2)} has been processed successfully.`
    }

    return this.sendEmail(
      { email, name },
      template,
      { tags: [{ name: 'type', value: 'payment_confirmation' }] }
    )
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(
    email: string,
    name: string,
    notification: {
      title: string
      message: string
      actionUrl?: string
      actionText?: string
    }
  ): Promise<EmailResult> {
    const template: EmailTemplate = {
      subject: notification.title,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>${notification.title}</h1>
          <p>Hi ${name},</p>
          <p>${notification.message}</p>
          ${notification.actionUrl && notification.actionText ? `
            <a href="${notification.actionUrl}" 
               style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              ${notification.actionText}
            </a>
          ` : ''}
          <p>Best regards,<br>The TATU Team</p>
        </div>
      `,
      text: `${notification.title} - Hi ${name}, ${notification.message}`
    }

    return this.sendEmail(
      { email, name },
      template,
      { tags: [{ name: 'type', value: 'notification' }] }
    )
  }
}

// Create singleton instance
export const emailService = EmailService.getInstance()

// Convenience functions
export const sendWelcomeEmail = (email: string, name: string, verificationToken?: string) =>
  emailService.sendWelcomeEmail(email, name, verificationToken)

export const sendAppointmentConfirmation = (email: string, name: string, appointmentDetails: any) =>
  emailService.sendAppointmentConfirmation(email, name, appointmentDetails)

export const sendPasswordResetEmail = (email: string, name: string, resetToken: string) =>
  emailService.sendPasswordResetEmail(email, name, resetToken)

export const sendArtistInvitationEmail = (email: string, name: string, shopName: string, invitationToken: string) =>
  emailService.sendArtistInvitationEmail(email, name, shopName, invitationToken)

export const sendReviewRequestEmail = (email: string, name: string, artistName: string, appointmentDate: string, reviewToken: string) =>
  emailService.sendReviewRequestEmail(email, name, artistName, appointmentDate, reviewToken)

export const sendPaymentConfirmationEmail = (email: string, name: string, paymentDetails: any) =>
  emailService.sendPaymentConfirmationEmail(email, name, paymentDetails)

export const sendNotificationEmail = (email: string, name: string, notification: any) =>
  emailService.sendNotificationEmail(email, name, notification)

export default emailService
