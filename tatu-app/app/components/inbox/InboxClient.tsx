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
  const [connectedAccounts, setConnectedAccounts] = useState(initialConnectedAccounts);

  const handleConnectAccount = async (platform: MessagePlatform) => {
    // TODO: Implement platform-specific OAuth flows
    switch (platform) {
      case MessagePlatform.EMAIL:
        // Redirect to Gmail OAuth
        window.location.href = '/api/auth/gmail';
        break;
      case MessagePlatform.INSTAGRAM:
        // Redirect to Instagram auth
        window.location.href = '/api/auth/instagram';
        break;
      // Add other platform handlers
    }
  };

  const handleMessageSelect = async (messageId: string) => {
    setSelectedMessageId(messageId);
    
    // Mark message as read
    try {
      await fetch(`/api/inbox/messages/${messageId}/read`, {
        method: 'POST',
      });
      
      // Update local state
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, unread: false } : msg
      ));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccountId(accountId);
    // TODO: Filter messages by selected account
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <MessageSidebar
        connectedAccounts={connectedAccounts}
        onConnectAccount={handleConnectAccount}
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