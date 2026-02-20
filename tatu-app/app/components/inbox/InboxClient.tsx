'use client';

import { useState } from 'react';
import { MessageList } from './MessageList';
import { MessageSidebar } from './MessageSidebar';
import { ConnectedAccount, UnifiedMessage, MessageThread, MessagePlatform } from '@prisma/client';

type InboxClientProps = {
  initialMessages: (UnifiedMessage & {
    thread: MessageThread | null;
    attachments: { id: string; url: string; type: string }[];
  })[];
  initialConnectedAccounts: ConnectedAccount[];
};

export function InboxClient({ initialMessages, initialConnectedAccounts }: InboxClientProps) {
  const [selectedMessageId, setSelectedMessageId] = useState<string>();
  const [selectedAccountId, setSelectedAccountId] = useState<string>();
  const [messages, setMessages] = useState(initialMessages);
  const [connectedAccounts] = useState(initialConnectedAccounts);

  const handleConnectAccount = async (platform: MessagePlatform) => {
    switch (platform) {
      case MessagePlatform.EMAIL:
        window.location.href = '/api/auth/gmail';
        break;
      case MessagePlatform.OUTLOOK:
        window.location.href = '/api/integrations/outlook/auth';
        break;
      case MessagePlatform.INSTAGRAM:
        window.location.href = '/api/instagram/auth';
        break;
      case MessagePlatform.FACEBOOK:
        window.location.href = '/api/integrations/facebook/auth';
        break;
      case MessagePlatform.X_TWITTER:
        window.location.href = '/api/integrations/twitter/auth';
        break;
      case MessagePlatform.SMS:
        await fetch('/api/integrations/sms/provision', { method: 'POST' });
        window.location.href = '/dashboard/inbox';
        break;
    }
  };

  const handleConnectAlias = (provider: 'hotmail' | 'msn') => {
    const providerQuery = encodeURIComponent(provider)
    window.location.href = `/api/integrations/outlook/auth?provider=${providerQuery}`
  }

  const handleMessageSelect = async (messageId: string) => {
    setSelectedMessageId(messageId);
    
    // Mark message as read
    try {
      await fetch(`/api/inbox/messages/${messageId}/read`, {
        method: 'POST',
      });
      
      // Update local state
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, status: 'READ' } : msg
      ));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const handleAccountSelect = async (accountId: string) => {
    setSelectedAccountId(accountId);
    const account = connectedAccounts.find((item) => item.id === accountId);
    if (!account) return;

    try {
      const response = await fetch(
        `/api/inbox/messages?platform=${encodeURIComponent(account.platform)}&limit=50`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch account messages');
      }

      const data = await response.json();
      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Failed to filter messages by account:', error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <MessageSidebar
        connectedAccounts={connectedAccounts}
        onConnectAccount={handleConnectAccount}
        onConnectAlias={handleConnectAlias}
        selectedAccountId={selectedAccountId}
        onAccountSelect={handleAccountSelect}
      />
      <main className="flex-1 overflow-y-auto">
        <MessageList
          messages={messages}
          onMessageSelect={handleMessageSelect}
          selectedMessageId={selectedMessageId}
        />
      </main>
    </div>
  );
} 