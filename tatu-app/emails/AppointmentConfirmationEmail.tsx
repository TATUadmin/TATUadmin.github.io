import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { format } from 'date-fns'

interface AppointmentConfirmationEmailProps {
  appointmentTitle: string
  shopName: string
  artistName: string
  clientName: string
  startTime: Date
  endTime: Date
  serviceName: string
  price: number
  notes?: string
}

export const AppointmentConfirmationEmail = ({
  appointmentTitle,
  shopName,
  artistName,
  clientName,
  startTime,
  endTime,
  serviceName,
  price,
  notes,
}: AppointmentConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Your appointment at {shopName} has been confirmed</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Appointment Confirmed</Heading>
          <Text style={text}>
            Hi {clientName},
          </Text>
          <Text style={text}>
            Your appointment for {appointmentTitle} at {shopName} has been confirmed.
          </Text>

          <Section style={detailsContainer}>
            <Text style={detailsHeading}>Appointment Details:</Text>
            <Text style={detailsText}>
              Date: {format(startTime, 'MMMM d, yyyy')}
              <br />
              Time: {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
              <br />
              Artist: {artistName}
              <br />
              Service: {serviceName}
              <br />
              Price: ${price.toFixed(2)}
              {notes && (
                <>
                  <br />
                  Notes: {notes}
                </>
              )}
            </Text>
          </Section>

          <Text style={text}>
            If you need to make any changes to your appointment, please contact the shop directly.
          </Text>

          <Text style={footer}>
            Best regards,<br />
            The {shopName} Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
}

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
}

const text = {
  color: '#1a1a1a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const detailsContainer = {
  backgroundColor: '#f9fafb',
  padding: '24px',
  borderRadius: '8px',
  margin: '24px 0',
}

const detailsHeading = {
  color: '#1a1a1a',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const detailsText = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const footer = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '48px 0 0',
} 