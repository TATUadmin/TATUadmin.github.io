import { Suspense } from 'react';
import { InboxClient } from '@/components/inbox/InboxClient';
import { LoadingState } from '@/components/inbox/LoadingState';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function getInboxData() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { messages: [], connectedAccounts: [] };
  }

  const [messages, connectedAccounts] = await Promise.all([
    prisma.unifiedMessage.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        thread: true,
        attachments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
    prisma.connectedAccount.findMany({
      where: {
        userId: session.user.id,
      },
    }),
  ]);

  return { messages, connectedAccounts };
}

export default async function InboxPage() {
  const { messages, connectedAccounts } = await getInboxData();

  return (
    <div className="h-[calc(100vh-4rem)]">
      <Suspense fallback={<LoadingState />}>
        <InboxClient
          initialMessages={messages}
          initialConnectedAccounts={connectedAccounts}
        />
      </Suspense>
    </div>
  );
} 