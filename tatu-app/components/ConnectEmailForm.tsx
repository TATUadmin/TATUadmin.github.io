'use client';

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ConnectEmailForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [instagramUsername, setInstagramUsername] = useState('')
  const [instagramPassword, setInstagramPassword] = useState('')

  const handleGmailConnect = async () => {
    try {
      setIsLoading(true)
      // Redirect to Google OAuth consent screen
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      const redirectUri = `${window.location.origin}/api/auth/callback/google`
      const scope = 'https://www.googleapis.com/auth/gmail.readonly'
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `response_type=code&` +
        `scope=${scope}&` +
        `access_type=offline&` +
        `prompt=consent`

      window.location.href = authUrl
    } catch (error) {
      console.error('Error connecting Gmail:', error)
      toast({
        title: 'Error',
        description: 'Failed to connect Gmail account. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInstagramConnect = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const response = await fetch('/api/inbox/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: 'INSTAGRAM',
          accountId: instagramUsername,
          accessToken: instagramPassword, // This will be encrypted on the server
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to connect Instagram account')
      }

      toast({
        title: 'Success',
        description: 'Instagram account connected successfully.',
      })

      setInstagramUsername('')
      setInstagramPassword('')
    } catch (error) {
      console.error('Error connecting Instagram:', error)
      toast({
        title: 'Error',
        description: 'Failed to connect Instagram account. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connect Gmail</CardTitle>
          <CardDescription>
            Connect your Gmail account to manage your emails in one place.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGmailConnect}
            disabled={isLoading}
          >
            <img
              src="/google.svg"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            {isLoading ? 'Connecting...' : 'Connect Gmail'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connect Instagram</CardTitle>
          <CardDescription>
            Connect your Instagram account to manage your direct messages.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInstagramConnect} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={instagramUsername}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstagramUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={instagramPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInstagramPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect Instagram'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 