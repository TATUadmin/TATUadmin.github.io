/**
 * Gmail/Google Email Integration
 * Uses Gmail API for reading and sending emails
 * 
 * Setup Requirements:
 * 1. Use same Google Cloud Project as Calendar
 * 2. Enable Gmail API
 * 3. Add gmail.readonly, gmail.send, gmail.modify scopes to OAuth
 * 4. No app review needed for personal use
 */

import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '@/lib/prisma'
import { categorizeMessage } from '@/lib/services/ai-message-categorization'

export class GmailIntegration {
  private oauth2Client: OAuth2Client
  private gmail: any

  constructor(accessToken?: string, refreshToken?: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    if (accessToken && refreshToken) {
      this.oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
    }

    this.gmail = google.gmail({ version: 'v1', auth: this.oauth2Client })
  }

  /**
   * Get OAuth authorization URL (includes Gmail scopes)
   */
  static getAuthUrl(): string {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/integrations/gmail/callback`
    )

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify',
      ],
      prompt: 'consent',
    })
  }

  /**
   * Fetch recent messages
   */
  async getMessages(maxResults: number = 50, since?: Date): Promise<any[]> {
    try {
      let query = 'in:inbox'
      if (since) {
        const timestamp = Math.floor(since.getTime() / 1000)
        query += ` after:${timestamp}`
      }

      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults,
      })

      const messages = response.data.messages || []
      
      // Fetch full message details
      const fullMessages = await Promise.all(
        messages.map((msg: any) =>
          this.gmail.users.messages.get({
            userId: 'me',
            id: msg.id,
            format: 'full',
          })
        )
      )

      return fullMessages.map(m => m.data)
    } catch (error) {
      console.error('Error fetching Gmail messages:', error)
      throw error
    }
  }

  /**
   * Parse Gmail message headers
   */
  static parseHeaders(message: any) {
    const headers = message.payload?.headers || []
    const getHeader = (name: string) =>
      headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())
        ?.value || ''

    return {
      from: getHeader('from'),
      to: getHeader('to'),
      subject: getHeader('subject'),
      date: getHeader('date'),
      messageId: getHeader('message-id'),
      inReplyTo: getHeader('in-reply-to'),
    }
  }

  /**
   * Extract email body from Gmail message
   */
  static extractBody(message: any): string {
    const parts = message.payload?.parts || [message.payload]
    
    for (const part of parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8')
      }
    }

    // Fallback to HTML if no plain text
    for (const part of parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8')
      }
    }

    return ''
  }

  /**
   * Extract sender name and email from "From" header
   */
  static parseSender(from: string): { name: string; email: string } {
    // Format: "Name <email@example.com>" or just "email@example.com"
    const match = from.match(/^"?([^"<]*)"?\s*<?([^>]+)>?$/)
    if (match) {
      return {
        name: match[1].trim() || match[2],
        email: match[2],
      }
    }
    return { name: from, email: from }
  }

  /**
   * Convert Gmail message to TATU format
   */
  static async convertGmailMessageToTatu(gmailMessage: any, userId: string) {
    const headers = GmailIntegration.parseHeaders(gmailMessage)
    const body = GmailIntegration.extractBody(gmailMessage)
    const sender = GmailIntegration.parseSender(headers.from)

    // Use AI to categorize the message
    const categorization = await categorizeMessage(
      body,
      headers.subject,
      'EMAIL'
    )

    return {
      userId,
      platform: 'EMAIL',
      externalId: gmailMessage.id,
      sender: sender.email,
      senderName: sender.name,
      subject: headers.subject,
      content: body,
      receivedAt: new Date(headers.date || Date.now()),
      status: gmailMessage.labelIds?.includes('UNREAD') ? 'UNREAD' : 'READ',
      category: categorization.category,
      priority: categorization.priority,
      sentiment: categorization.sentiment,
    }
  }

  /**
   * Send an email
   */
  async sendEmail(to: string, subject: string, body: string, inReplyTo?: string) {
    try {
      const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        inReplyTo ? `In-Reply-To: ${inReplyTo}` : '',
        'Content-Type: text/plain; charset=utf-8',
        '',
        body,
      ]
        .filter(Boolean)
        .join('\n')

      const encodedEmail = Buffer.from(email).toString('base64url')

      const response = await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail,
        },
      })

      return response.data
    } catch (error) {
      console.error('Error sending Gmail message:', error)
      throw error
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD'],
        },
      })
    } catch (error) {
      console.error('Error marking Gmail message as read:', error)
      throw error
    }
  }

  /**
   * Archive message (remove from inbox)
   */
  async archiveMessage(messageId: string) {
    try {
      await this.gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['INBOX'],
        },
      })
    } catch (error) {
      console.error('Error archiving Gmail message:', error)
      throw error
    }
  }

  /**
   * Sync Gmail messages for a user
   */
  static async syncUserGmail(userId: string, accountId: string) {
    try {
      const account = await prisma.connectedAccount.findFirst({
        where: {
          userId,
          platform: 'EMAIL',
          accountId,
        },
      })

      if (!account) {
        throw new Error('Gmail account not connected')
      }

      const integration = new GmailIntegration(
        account.accessToken,
        account.refreshToken || undefined
      )

      // Sync messages since last sync (or last 7 days if never synced)
      const since = account.lastSynced || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const messages = await integration.getMessages(50, since)

      let syncedCount = 0

      for (const message of messages) {
        // Skip if we already have this message
        const existing = await prisma.unifiedMessage.findFirst({
          where: {
            externalId: message.id,
            platform: 'EMAIL',
          },
        })

        if (!existing) {
          const tatuMessage = await GmailIntegration.convertGmailMessageToTatu(
            message,
            userId
          )

          await prisma.unifiedMessage.create({
            data: tatuMessage,
          })
          syncedCount++
        }
      }

      // Update last synced timestamp
      await prisma.connectedAccount.update({
        where: { id: account.id },
        data: { lastSynced: new Date() },
      })

      return { success: true, syncedCount }
    } catch (error) {
      console.error('Error syncing Gmail:', error)
      throw error
    }
  }
}

/**
 * Alternative: IMAP integration for non-Gmail accounts
 * This would use the imap-simple library for standard email accounts
 */
export class IMAPIntegration {
  // TODO: Implement IMAP/SMTP for generic email accounts
  // Uses nodemailer + imap-simple packages
}
