import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface MessageCategorizationResult {
  category: 'BOOKING' | 'INQUIRY' | 'CANCELLATION' | 'FOLLOW_UP' | 'GENERAL' | 'URGENT' | 'SPAM'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
  suggestedLabels?: string[]
  extractedInfo?: {
    clientName?: string
    desiredStyle?: string
    placement?: string
    budget?: string
    timeline?: string
    phoneNumber?: string
    email?: string
  }
}

/**
 * Categorize a message using AI
 * @param content - The message content
 * @param subject - Optional subject line (for emails)
 * @param platform - The platform the message came from
 * @returns Categorization result
 */
export async function categorizeMessage(
  content: string,
  subject?: string,
  platform?: string
): Promise<MessageCategorizationResult> {
  try {
    const prompt = `
You are an AI assistant helping a tattoo artist categorize and analyze client messages.

Message Platform: ${platform || 'Unknown'}
Subject: ${subject || 'N/A'}
Content: ${content}

Please analyze this message and return a JSON object with the following fields:

1. category: One of: BOOKING, INQUIRY, CANCELLATION, FOLLOW_UP, GENERAL, URGENT, SPAM
   - BOOKING: Client wants to book an appointment
   - INQUIRY: Client asking about pricing, availability, or design
   - CANCELLATION: Client canceling or rescheduling
   - FOLLOW_UP: Following up on previous conversation
   - GENERAL: General question or comment
   - URGENT: Requires immediate attention
   - SPAM: Spam or irrelevant message

2. priority: HIGH, MEDIUM, or LOW
   - HIGH: Booking requests, cancellations, urgent matters
   - MEDIUM: Inquiries, follow-ups
   - LOW: General comments, non-urgent

3. sentiment: POSITIVE, NEUTRAL, or NEGATIVE
   - Based on the tone and emotion of the message

4. suggestedLabels: Array of relevant tags (e.g., ["geometric", "first-timer", "budget-conscious"])

5. extractedInfo: Object with extracted details:
   - clientName: Client's name if mentioned
   - desiredStyle: Tattoo style mentioned (geometric, traditional, realism, etc.)
   - placement: Body location mentioned (arm, back, leg, etc.)
   - budget: Budget range if mentioned
   - timeline: When they want the tattoo (specific date or timeframe)
   - phoneNumber: Phone number if provided
   - email: Email if provided

Return ONLY valid JSON, no additional text.
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that categorizes tattoo artist messages. Always return valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 500,
    })

    const result = JSON.parse(response.choices[0].message.content || '{}')
    return result as MessageCategorizationResult
  } catch (error) {
    console.error('Error categorizing message with AI:', error)
    
    // Fallback to simple categorization
    return simpleCategorizeFallback(content, subject)
  }
}

/**
 * Simple rule-based fallback categorization if AI fails
 */
function simpleCategorizeFallback(
  content: string,
  subject?: string
): MessageCategorizationResult {
  const lowerContent = content.toLowerCase()
  const lowerSubject = subject?.toLowerCase() || ''
  const combined = lowerContent + ' ' + lowerSubject

  let category: MessageCategorizationResult['category'] = 'GENERAL'
  let priority: MessageCategorizationResult['priority'] = 'MEDIUM'
  let sentiment: MessageCategorizationResult['sentiment'] = 'NEUTRAL'

  // Detect category
  if (
    /book|appointment|schedule|available|availability|slot|session/i.test(combined)
  ) {
    category = 'BOOKING'
    priority = 'HIGH'
  } else if (/cancel|reschedule|postpone|can't make it/i.test(combined)) {
    category = 'CANCELLATION'
    priority = 'HIGH'
  } else if (
    /price|pricing|cost|how much|quote|estimate|rate/i.test(combined)
  ) {
    category = 'INQUIRY'
    priority = 'MEDIUM'
  } else if (/follow|following up|just checking|any update/i.test(combined)) {
    category = 'FOLLOW_UP'
    priority = 'MEDIUM'
  } else if (/urgent|asap|emergency|immediately/i.test(combined)) {
    category = 'URGENT'
    priority = 'HIGH'
  }

  // Detect sentiment
  if (
    /love|amazing|beautiful|great|excellent|perfect|thank you|thanks/i.test(
      combined
    )
  ) {
    sentiment = 'POSITIVE'
  } else if (
    /disappointed|unhappy|problem|issue|complaint|bad|terrible/i.test(combined)
  ) {
    sentiment = 'NEGATIVE'
  }

  return {
    category,
    priority,
    sentiment,
    suggestedLabels: [],
    extractedInfo: {},
  }
}

/**
 * Generate smart reply suggestions for a message
 * @param messageContent - The message to reply to
 * @param categorization - The categorization result
 * @param artistName - The artist's name
 * @returns Array of suggested replies
 */
export async function generateSmartReplies(
  messageContent: string,
  categorization: MessageCategorizationResult,
  artistName: string = 'Artist'
): Promise<string[]> {
  try {
    const prompt = `
You are helping ${artistName}, a tattoo artist, respond to a client message.

Message: ${messageContent}
Category: ${categorization.category}
Sentiment: ${categorization.sentiment}

Generate 3 different professional reply options:
1. A friendly and enthusiastic response
2. A professional and informative response
3. A brief and direct response

Each reply should:
- Be appropriate for the category (${categorization.category})
- Match the tone of the original message
- Be concise (2-4 sentences)
- Sound natural and personable
- Include relevant next steps or questions

Return as JSON array of strings.
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that generates professional message replies for tattoo artists. Always return valid JSON array.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    })

    const result = JSON.parse(response.choices[0].message.content || '{"replies":[]}')
    return result.replies || []
  } catch (error) {
    console.error('Error generating smart replies:', error)
    return generateFallbackReplies(categorization.category)
  }
}

/**
 * Fallback reply templates
 */
function generateFallbackReplies(
  category: MessageCategorizationResult['category']
): string[] {
  const templates: Record<string, string[]> = {
    BOOKING: [
      "Thanks for reaching out! I'd love to work with you. I have availability next week on Tuesday and Thursday. What works best for you?",
      "Hey! I'm excited about this project. Let me check my calendar and get back to you with some available time slots. Can you tell me more about the size and placement you're thinking?",
      "I can definitely fit you in! I'm booking 2-3 weeks out right now. Would you like to schedule a quick consultation first, or do you have a design ready to go?",
    ],
    INQUIRY: [
      "Great question! For a piece like that, pricing typically ranges from $X to $Y depending on size and detail. Want to send me some reference images so I can give you a more accurate quote?",
      "Thanks for your interest! I'd need to see the design and know the size/placement to give you an exact price. Feel free to send over any reference photos or ideas you have!",
      "I'd be happy to provide a quote! Can you share more details about what you're thinking? (Size, placement, style, any reference images?)",
    ],
    CANCELLATION: [
      "No worries, I understand! Thanks for letting me know. Would you like to reschedule for a different time, or should I keep you on my waitlist for future openings?",
      "Thanks for the heads up! Life happens. Let me know when you'd like to reschedule and I'll find a spot for you.",
      "All good! I appreciate you letting me know in advance. Feel free to reach out when you're ready to rebook.",
    ],
    FOLLOW_UP: [
      "Thanks for following up! I haven't forgotten about you. Let me get you those details by end of day today.",
      "Hey! Thanks for the reminder. I've been meaning to get back to you. Let me send over that information now.",
      "Appreciate you checking in! Yes, I'm still interested in working together. When would be a good time for you?",
    ],
    GENERAL: [
      "Thanks for reaching out! How can I help you?",
      "Hey! Thanks for the message. What can I do for you?",
      "Thanks for getting in touch! Let me know if you have any questions.",
    ],
    URGENT: [
      "Got your message! I'll look into this right away and get back to you ASAP.",
      "Thanks for letting me know. I'm on it and will respond within the hour.",
      "Understood! Let me address this immediately. I'll call/text you shortly.",
    ],
    SPAM: [
      'Thank you for your message.',
      'Not interested, thanks.',
      'Please remove me from your list.',
    ],
  }

  return templates[category] || templates.GENERAL
}

/**
 * Batch categorize multiple messages
 * @param messages - Array of messages to categorize
 * @returns Array of categorization results
 */
export async function batchCategorizeMessages(
  messages: Array<{ id: string; content: string; subject?: string; platform?: string }>
): Promise<Array<MessageCategorizationResult & { id: string }>> {
  const results = await Promise.all(
    messages.map(async msg => {
      const categorization = await categorizeMessage(
        msg.content,
        msg.subject,
        msg.platform
      )
      return {
        id: msg.id,
        ...categorization,
      }
    })
  )

  return results
}
