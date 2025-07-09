import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'

export default function ConnectEmailForm() {
  const [isLoading, setIsLoading] = useState(false)

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

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Connect Email Account</CardTitle>
        <CardDescription>
          Connect your email accounts to manage all your messages in one place.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
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
          {/* Add more email providers here in the future */}
        </div>
      </CardContent>
    </Card>
  )
} 