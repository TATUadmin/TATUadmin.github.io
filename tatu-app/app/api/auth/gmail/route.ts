import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';
import { prisma } from '@/lib/prisma';
import { MessagePlatform } from '@prisma/client';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/auth/gmail/callback`
);

// Scopes required for Gmail API
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Generate OAuth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      state: session.user.id, // Pass user ID to callback
    });

    // Redirect to Google OAuth consent screen
    return new NextResponse(null, {
      status: 302,
      headers: {
        Location: authUrl,
      },
    });
  } catch (error) {
    console.error('Error initiating Gmail OAuth:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Callback handler
export async function POST(request: Request) {
  try {
    const { code, state } = await request.json();
    
    // Get tokens from code
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user email
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    const email = profile.data.emailAddress;

    if (!email) {
      throw new Error('Could not get email from Gmail profile');
    }

    // Store connected account
    await prisma.connectedAccount.create({
      data: {
        platform: MessagePlatform.EMAIL,
        email,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        userId: state, // User ID from state parameter
      },
    });

    return new NextResponse('Gmail account connected successfully', { status: 200 });
  } catch (error) {
    console.error('Error handling Gmail OAuth callback:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 