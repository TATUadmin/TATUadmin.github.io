import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { prisma } from '@/lib/prisma'

export class GoogleCalendarIntegration {
  private oauth2Client: OAuth2Client

  constructor(accessToken?: string, refreshToken?: string) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/integrations/google/callback`
    )

    if (accessToken && refreshToken) {
      this.oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
    }
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events',
      ],
      prompt: 'consent', // Force to get refresh token
    })
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code)
    this.oauth2Client.setCredentials(tokens)
    return tokens
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(calendarId: string) {
    try {
      const calendar = await prisma.calendar.findUnique({
        where: { id: calendarId },
      })

      if (!calendar || !calendar.refreshToken) {
        throw new Error('Calendar or refresh token not found')
      }

      this.oauth2Client.setCredentials({
        refresh_token: calendar.refreshToken,
      })

      const { credentials } = await this.oauth2Client.refreshAccessToken()
      
      // Update tokens in database
      await prisma.calendar.update({
        where: { id: calendarId },
        data: {
          accessToken: credentials.access_token || undefined,
          tokenExpiresAt: credentials.expiry_date
            ? new Date(credentials.expiry_date)
            : undefined,
        },
      })

      return credentials
    } catch (error) {
      console.error('Error refreshing Google Calendar token:', error)
      throw error
    }
  }

  /**
   * Sync events from Google Calendar
   */
  async syncEvents(calendarId: string, since?: Date): Promise<any[]> {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: (since || new Date()).toISOString(),
        maxResults: 250,
        singleEvents: true,
        orderBy: 'startTime',
      })

      return response.data.items || []
    } catch (error: any) {
      // If token expired, try to refresh
      if (error.response?.status === 401) {
        await this.refreshAccessToken(calendarId)
        // Retry
        return this.syncEvents(calendarId, since)
      }
      throw error
    }
  }

  /**
   * Convert Google Calendar event to TATU event format
   */
  convertGoogleEventToTatuEvent(googleEvent: any, calendarId: string, userId: string) {
    return {
      calendarId,
      userId,
      title: googleEvent.summary || 'Untitled Event',
      description: googleEvent.description,
      location: googleEvent.location,
      startTime: new Date(
        googleEvent.start.dateTime || googleEvent.start.date
      ),
      endTime: new Date(
        googleEvent.end.dateTime || googleEvent.end.date
      ),
      allDay: !!googleEvent.start.date, // If date instead of dateTime
      timezone: googleEvent.start.timeZone || 'UTC',
      externalId: googleEvent.id,
      externalUrl: googleEvent.htmlLink,
      status: this.mapGoogleStatusToTatu(googleEvent.status),
      lastSyncedAt: new Date(),
    }
  }

  /**
   * Map Google Calendar status to TATU status
   */
  private mapGoogleStatusToTatu(googleStatus: string): string {
    const statusMap: Record<string, string> = {
      confirmed: 'CONFIRMED',
      tentative: 'TENTATIVE',
      cancelled: 'CANCELLED',
    }
    return statusMap[googleStatus] || 'CONFIRMED'
  }

  /**
   * Create event in Google Calendar
   */
  async createEvent(event: {
    title: string
    description?: string
    location?: string
    startTime: Date
    endTime: Date
    timezone?: string
    attendees?: string[]
  }) {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: event.title,
          description: event.description,
          location: event.location,
          start: {
            dateTime: event.startTime.toISOString(),
            timeZone: event.timezone || 'UTC',
          },
          end: {
            dateTime: event.endTime.toISOString(),
            timeZone: event.timezone || 'UTC',
          },
          attendees: event.attendees?.map(email => ({ email })),
        },
      })

      return response.data
    } catch (error) {
      console.error('Error creating Google Calendar event:', error)
      throw error
    }
  }

  /**
   * Update event in Google Calendar
   */
  async updateEvent(
    eventId: string,
    updates: {
      title?: string
      description?: string
      location?: string
      startTime?: Date
      endTime?: Date
      timezone?: string
    }
  ) {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

      const requestBody: any = {}
      if (updates.title) requestBody.summary = updates.title
      if (updates.description) requestBody.description = updates.description
      if (updates.location) requestBody.location = updates.location
      
      if (updates.startTime) {
        requestBody.start = {
          dateTime: updates.startTime.toISOString(),
          timeZone: updates.timezone || 'UTC',
        }
      }
      
      if (updates.endTime) {
        requestBody.end = {
          dateTime: updates.endTime.toISOString(),
          timeZone: updates.timezone || 'UTC',
        }
      }

      const response = await calendar.events.patch({
        calendarId: 'primary',
        eventId,
        requestBody,
      })

      return response.data
    } catch (error) {
      console.error('Error updating Google Calendar event:', error)
      throw error
    }
  }

  /**
   * Delete event from Google Calendar
   */
  async deleteEvent(eventId: string) {
    try {
      const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client })

      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
      })

      return true
    } catch (error) {
      console.error('Error deleting Google Calendar event:', error)
      throw error
    }
  }

  /**
   * Sync all events for a user's Google Calendar
   */
  static async syncUserGoogleCalendar(userId: string, calendarId: string) {
    try {
      const calendar = await prisma.calendar.findUnique({
        where: { id: calendarId },
      })

      if (!calendar || calendar.userId !== userId || calendar.provider !== 'GOOGLE') {
        throw new Error('Invalid calendar')
      }

      const integration = new GoogleCalendarIntegration(
        calendar.accessToken || undefined,
        calendar.refreshToken || undefined
      )

      // Get events since last sync (or from 30 days ago if never synced)
      const since = calendar.lastSyncedAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const googleEvents = await integration.syncEvents(calendarId, since)

      // Upsert events into database
      for (const googleEvent of googleEvents) {
        const tatuEvent = integration.convertGoogleEventToTatuEvent(
          googleEvent,
          calendarId,
          userId
        )

        await prisma.calendarEvent.upsert({
          where: {
            externalId: googleEvent.id,
          },
          update: tatuEvent,
          create: tatuEvent,
        })
      }

      // Update last synced timestamp
      await prisma.calendar.update({
        where: { id: calendarId },
        data: {
          lastSyncedAt: new Date(),
        },
      })

      return { success: true, syncedCount: googleEvents.length }
    } catch (error) {
      console.error('Error syncing Google Calendar:', error)
      throw error
    }
  }
}
