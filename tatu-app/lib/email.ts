import { Resend } from 'resend'
import { ArtistInvitationEmail } from '@/emails/ArtistInvitationEmail'
import { AppointmentConfirmationEmail } from '@/emails/AppointmentConfirmationEmail'
import { render } from '@react-email/render'

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendArtistInvitation = async ({
  artistEmail,
  artistName,
  shopName,
  inviteLink,
}: {
  artistEmail: string
  artistName: string
  shopName: string
  inviteLink: string
}) => {
  try {
    const html = render(
      ArtistInvitationEmail({
        artistName,
        shopName,
        inviteLink,
      })
    )

    const { data, error } = await resend.emails.send({
      from: 'TATU <notifications@tatu.app>',
      to: artistEmail,
      subject: `You've been invited to join ${shopName} on TATU`,
      html,
    })

    if (error) {
      console.error('Error sending artist invitation email:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error sending artist invitation email:', error)
    throw error
  }
}

export const sendArtistRemovalNotification = async ({
  artistEmail,
  artistName,
  shopName,
}: {
  artistEmail: string
  artistName: string
  shopName: string
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'TATU <notifications@tatu.app>',
      to: artistEmail,
      subject: `Update regarding your association with ${shopName}`,
      html: `
        <p>Hi ${artistName},</p>
        <p>This email is to inform you that your association with ${shopName} has been ended. If you believe this was done in error, please contact the shop directly.</p>
        <p>Best regards,<br>The TATU Team</p>
      `,
    })

    if (error) {
      console.error('Error sending artist removal notification:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error sending artist removal notification:', error)
    throw error
  }
}

export const sendShopStatusUpdateNotification = async ({
  ownerEmail,
  ownerName,
  shopName,
  newStatus,
}: {
  ownerEmail: string
  ownerName: string
  shopName: string
  newStatus: string
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'TATU <notifications@tatu.app>',
      to: ownerEmail,
      subject: `Shop Status Update: ${shopName}`,
      html: `
        <p>Hi ${ownerName},</p>
        <p>The status of your shop "${shopName}" has been updated to ${newStatus}.</p>
        ${
          newStatus === 'ACTIVE'
            ? '<p>Congratulations! Your shop is now live and visible to customers.</p>'
            : ''
        }
        <p>Best regards,<br>The TATU Team</p>
      `,
    })

    if (error) {
      console.error('Error sending shop status update notification:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error sending shop status update notification:', error)
    throw error
  }
}

export const sendAppointmentConfirmation = async ({
  appointmentTitle,
  shopName,
  artistName,
  clientName,
  clientEmail,
  startTime,
  endTime,
  serviceName,
  price,
  notes,
}: {
  appointmentTitle: string
  shopName: string
  artistName: string
  clientName: string
  clientEmail: string
  startTime: Date
  endTime: Date
  serviceName: string
  price: number
  notes?: string
}) => {
  try {
    const html = render(
      AppointmentConfirmationEmail({
        appointmentTitle,
        shopName,
        artistName,
        clientName,
        startTime,
        endTime,
        serviceName,
        price,
        notes,
      })
    )

    const { data, error } = await resend.emails.send({
      from: 'TATU <notifications@tatu.app>',
      to: clientEmail,
      subject: `Appointment Confirmed: ${appointmentTitle} at ${shopName}`,
      html,
    })

    if (error) {
      console.error('Error sending appointment confirmation email:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error)
    throw error
  }
}

export const sendAppointmentCancellation = async ({
  appointmentTitle,
  shopName,
  clientName,
  clientEmail,
  startTime,
}: {
  appointmentTitle: string
  shopName: string
  clientName: string
  clientEmail: string
  startTime: Date
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'TATU <notifications@tatu.app>',
      to: clientEmail,
      subject: `Appointment Cancelled: ${appointmentTitle} at ${shopName}`,
      html: `
        <p>Hi ${clientName},</p>
        <p>Your appointment for ${appointmentTitle} at ${shopName} scheduled for ${startTime.toLocaleDateString()} at ${startTime.toLocaleTimeString()} has been cancelled.</p>
        <p>If you would like to reschedule, please visit our website or contact the shop directly.</p>
        <p>Best regards,<br>The ${shopName} Team</p>
      `,
    })

    if (error) {
      console.error('Error sending appointment cancellation email:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error sending appointment cancellation email:', error)
    throw error
  }
}

export const sendAppointmentReminder = async ({
  appointmentTitle,
  shopName,
  artistName,
  clientName,
  clientEmail,
  startTime,
  endTime,
  serviceName,
  notes,
}: {
  appointmentTitle: string
  shopName: string
  artistName: string
  clientName: string
  clientEmail: string
  startTime: Date
  endTime: Date
  serviceName: string
  notes?: string
}) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'TATU <notifications@tatu.app>',
      to: clientEmail,
      subject: `Reminder: Your Appointment at ${shopName} Tomorrow`,
      html: `
        <p>Hi ${clientName},</p>
        <p>This is a reminder about your appointment tomorrow at ${shopName}.</p>
        <p><strong>Appointment Details:</strong><br>
        Date: ${startTime.toLocaleDateString()}<br>
        Time: ${startTime.toLocaleTimeString()} - ${endTime.toLocaleTimeString()}<br>
        Artist: ${artistName}<br>
        Service: ${serviceName}<br>
        ${notes ? `Notes: ${notes}<br>` : ''}
        </p>
        <p>If you need to make any changes, please contact the shop as soon as possible.</p>
        <p>Best regards,<br>The ${shopName} Team</p>
      `,
    })

    if (error) {
      console.error('Error sending appointment reminder email:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error sending appointment reminder email:', error)
    throw error
  }
} 