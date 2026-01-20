/**
 * Instagram/Facebook Messenger Integration
 * Uses Meta Graph API for Instagram Direct Messages
 * 
 * Setup Requirements:
 * 1. Create Facebook Developer App
 * 2. Add Instagram Basic Display and Instagram Messaging products
 * 3. Request instagram_basic, instagram_manage_messages permissions
 * 4. Submit app for App Review (required for production)
 * 5. Set up webhook subscriptions for real-time messages
 */

import { prisma } from '@/lib/prisma'

export class InstagramIntegration {
  private accessToken: string
  private pageId?: string

  constructor(accessToken: string, pageId?: string) {
    this.accessToken = accessToken
    this.pageId = pageId
  }

  /**
   * Get OAuth authorization URL
   */
  static getAuthUrl(): string {
    const clientId = process.env.FACEBOOK_APP_ID
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/instagram/callback`
    
    const params = new URLSearchParams({
      client_id: clientId || '',
      redirect_uri: redirectUri,
      scope: 'instagram_basic,instagram_manage_messages,pages_messaging',
      response_type: 'code',
    })

    return `https://www.facebook.com/v18.0/dialog/oauth?${params}`
  }

  /**
   * Exchange code for access token
   */
  static async getTokensFromCode(code: string) {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${process.env.FACEBOOK_APP_ID}` +
      `&client_secret=${process.env.FACEBOOK_APP_SECRET}` +
      `&redirect_uri=${process.env.NEXTAUTH_URL}/api/integrations/instagram/callback` +
      `&code=${code}`
    )

    if (!response.ok) {
      throw new Error('Failed to get Instagram access token')
    }

    return await response.json()
  }

  /**
   * Get Instagram Business Account ID from Page
   */
  async getInstagramAccountId(): Promise<string> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${this.pageId}?fields=instagram_business_account&access_token=${this.accessToken}`
    )

    if (!response.ok) {
      throw new Error('Failed to get Instagram account ID')
    }

    const data = await response.json()
    return data.instagram_business_account.id
  }

  /**
   * Fetch recent conversations/DMs
   */
  async getConversations(limit: number = 25): Promise<any[]> {
    const igAccountId = await this.getInstagramAccountId()
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}/conversations?platform=instagram&limit=${limit}&access_token=${this.accessToken}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch Instagram conversations')
    }

    const data = await response.json()
    return data.data || []
  }

  /**
   * Get messages from a conversation
   */
  async getMessages(conversationId: string): Promise<any[]> {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${conversationId}/messages?fields=id,from,to,message,created_time&access_token=${this.accessToken}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch Instagram messages')
    }

    const data = await response.json()
    return data.data || []
  }

  /**
   * Send a message
   */
  async sendMessage(recipientId: string, message: string): Promise<any> {
    const igAccountId = await this.getInstagramAccountId()
    
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${igAccountId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: message },
          access_token: this.accessToken,
        }),
      }
    )

    if (!response.ok) {
      throw new Error('Failed to send Instagram message')
    }

    return await response.json()
  }

  /**
   * Convert Instagram message to TATU format
   */
  static convertInstagramMessageToTatu(igMessage: any, userId: string) {
    return {
      userId,
      platform: 'INSTAGRAM',
      externalId: igMessage.id,
      sender: igMessage.from.username || igMessage.from.id,
      senderName: igMessage.from.name || igMessage.from.username,
      content: igMessage.message,
      receivedAt: new Date(igMessage.created_time),
      status: 'UNREAD',
    }
  }

  /**
   * Sync Instagram messages for a user
   */
  static async syncUserInstagram(userId: string, accountId: string) {
    try {
      const account = await prisma.connectedAccount.findFirst({
        where: {
          userId,
          platform: 'INSTAGRAM',
          accountId,
        },
      })

      if (!account) {
        throw new Error('Instagram account not connected')
      }

      const integration = new InstagramIntegration(account.accessToken, accountId)
      
      // Get recent conversations
      const conversations = await integration.getConversations()
      
      let syncedCount = 0

      // Sync messages from each conversation
      for (const conversation of conversations) {
        const messages = await integration.getMessages(conversation.id)
        
        for (const message of messages) {
          // Skip if we already have this message
          const existing = await prisma.unifiedMessage.findFirst({
            where: {
              externalId: message.id,
              platform: 'INSTAGRAM',
            },
          })

          if (!existing) {
            await prisma.unifiedMessage.create({
              data: InstagramIntegration.convertInstagramMessageToTatu(
                message,
                userId
              ),
            })
            syncedCount++
          }
        }
      }

      // Update last synced timestamp
      await prisma.connectedAccount.update({
        where: { id: account.id },
        data: { lastSynced: new Date() },
      })

      return { success: true, syncedCount }
    } catch (error) {
      console.error('Error syncing Instagram:', error)
      throw error
    }
  }
}

/**
 * Webhook handler for real-time Instagram messages
 * This should be called from /api/webhooks/instagram
 */
export async function handleInstagramWebhook(body: any) {
  // Verify webhook signature
  // Process incoming message
  // Save to database
  // Trigger AI categorization
  // Send real-time notification to user
  
  console.log('Instagram webhook received:', body)
  
  // TODO: Implement full webhook processing
  return { success: true }
}
