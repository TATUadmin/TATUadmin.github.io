import { useState } from 'react';
import { MessagePlatform, UnifiedMessage, MessageThread } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { Mail, Instagram, Facebook, Twitter } from 'lucide-react';

type MessageListProps = {
  messages: (UnifiedMessage & {
    thread: MessageThread | null;
    attachments: { id: string; url: string; type: string }[];
  })[];
  onMessageSelect: (messageId: string) => void;
  selectedMessageId?: string;
};

const platformIcons = {
  [MessagePlatform.EMAIL]: Mail,
  [MessagePlatform.INSTAGRAM]: Instagram,
  [MessagePlatform.FACEBOOK]: Facebook,
  [MessagePlatform.X_TWITTER]: Twitter,
};

export function MessageList({ messages, onMessageSelect, selectedMessageId }: MessageListProps) {
  // Group messages by thread
  const messagesByThread = messages.reduce((acc, message) => {
    const threadId = message.threadId || message.id;
    if (!acc[threadId]) {
      acc[threadId] = [];
    }
    acc[threadId].push(message);
    return acc;
  }, {} as Record<string, typeof messages>);

  return (
    <div className="flex flex-col divide-y divide-gray-200">
      {Object.entries(messagesByThread).map(([threadId, threadMessages]) => {
        const latestMessage = threadMessages[0];
        const PlatformIcon = platformIcons[latestMessage.platform];

        return (
          <button
            key={threadId}
            onClick={() => onMessageSelect(latestMessage.id)}
            className={`flex items-start p-4 hover:bg-gray-50 transition-colors ${
              selectedMessageId === latestMessage.id ? 'bg-gray-100' : ''
            }`}
          >
            <div className="flex-shrink-0 mr-4">
              <PlatformIcon className="w-5 h-5 text-gray-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {latestMessage.senderName || latestMessage.senderEmail}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(latestMessage.createdAt), { addSuffix: true })}
                </p>
              </div>
              <p className="mt-1 text-sm text-gray-500 truncate">{latestMessage.subject}</p>
              <p className="mt-1 text-sm text-gray-600 line-clamp-2">{latestMessage.content}</p>
              {latestMessage.attachments.length > 0 && (
                <div className="mt-2 flex items-center">
                  <span className="text-xs text-gray-500">
                    {latestMessage.attachments.length} attachment(s)
                  </span>
                </div>
              )}
            </div>
            {latestMessage.unread && (
              <div className="ml-2 flex-shrink-0">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
} 