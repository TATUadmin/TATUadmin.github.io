import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface ArtistInvitationEmailProps {
  shopName: string
  artistName: string
  inviteLink: string
}

export const ArtistInvitationEmail = ({
  shopName,
  artistName,
  inviteLink,
}: ArtistInvitationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join {shopName} on TATU</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Join {shopName} on TATU</Heading>
          <Text style={text}>
            Hi {artistName},
          </Text>
          <Text style={text}>
            You've been invited to join {shopName} as an artist on TATU. This is an exciting opportunity to showcase your work and connect with new clients.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={inviteLink}>
              Accept Invitation
            </Button>
          </Section>
          <Text style={text}>
            If you have any questions, please don't hesitate to reach out to the shop directly.
          </Text>
          <Text style={footer}>
            Best regards,<br />
            The TATU Team
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

const buttonContainer = {
  margin: '24px 0',
}

const button = {
  backgroundColor: '#4F46E5',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
  textAlign: 'center' as const,
}

const footer = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '48px 0 0',
} 