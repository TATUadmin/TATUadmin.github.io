import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { MessageList } from '@/components/inbox/MessageList'
import { MessageSidebar } from '@/components/inbox/MessageSidebar'
import { redirect } from 'next/navigation'

export default async function InboxPage() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }

  // Get connected accounts
  const accounts = await prisma.connectedAccount.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      platform: true,
      accountId: true,
      lastSynced: true,
    },
  })

  // Get messages with pagination
  const messages = await prisma.unifiedMessage.findMany({
    where: { 
      userId: session.user.id,
      status: { not: 'DELETED' }
    },
    include: {
      attachments: true,
      thread: {
        select: {
          id: true,
          subject: true,
          participants: true,
          lastMessageAt: true,
        },
      },
    },
    orderBy: { receivedAt: 'desc' },
    take: 50,
  })

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <MessageSidebar accounts={accounts} />
      <main className="flex-1 overflow-y-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Unified Inbox</h1>
        {accounts.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-2">No accounts connected</h2>
            <p className="text-muted-foreground mb-4">
              Connect your email accounts to start managing all your messages in one place.
            </p>
            <a
              href="/dashboard/inbox/connect"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Connect Account
            </a>
          </div>
        ) : (
          <MessageList messages={messages} />
        )}
      </main>
    </div>
  )
} 