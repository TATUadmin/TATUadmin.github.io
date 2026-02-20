import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import crypto from 'crypto'
import { getOutlookAuthUrl } from '@/lib/integrations/outlook'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const provider = searchParams.get('provider')
  const loginHintByProvider: Record<string, string> = {
    hotmail: '@hotmail.com',
    msn: '@msn.com',
  }

  const state = crypto.randomUUID()
  const authUrl = getOutlookAuthUrl(state, {
    loginHint: provider ? loginHintByProvider[provider] : undefined,
    prompt: 'select_account',
  })

  const response = NextResponse.redirect(authUrl)
  response.cookies.set('outlook_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 10,
  })

  return response
}
