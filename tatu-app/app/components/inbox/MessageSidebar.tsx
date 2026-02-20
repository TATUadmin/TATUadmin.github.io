'use client';

import { ConnectedAccount, MessagePlatform } from '@prisma/client';
import { Mail, Instagram, Facebook, Twitter, MessageCircleMore, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type MessageSidebarProps = {
  connectedAccounts: ConnectedAccount[];
  onConnectAccount: (platform: MessagePlatform) => void;
  onConnectAlias?: (provider: 'hotmail' | 'msn') => void;
  selectedAccountId?: string;
  onAccountSelect: (accountId: string) => void;
};

const platformIcons = {
  [MessagePlatform.EMAIL]: Mail,
  [MessagePlatform.OUTLOOK]: Mail,
  [MessagePlatform.INSTAGRAM]: Instagram,
  [MessagePlatform.FACEBOOK]: Facebook,
  [MessagePlatform.X_TWITTER]: Twitter,
  [MessagePlatform.SMS]: MessageCircleMore,
  [MessagePlatform.INTERNAL]: MessageCircleMore,
};

const platformLabels = {
  [MessagePlatform.EMAIL]: 'Email',
  [MessagePlatform.OUTLOOK]: 'Outlook',
  [MessagePlatform.INSTAGRAM]: 'Instagram',
  [MessagePlatform.FACEBOOK]: 'Facebook',
  [MessagePlatform.X_TWITTER]: 'Twitter',
  [MessagePlatform.SMS]: 'SMS',
  [MessagePlatform.INTERNAL]: 'Internal',
};

const connectablePlatforms: MessagePlatform[] = [
  MessagePlatform.EMAIL,
  MessagePlatform.OUTLOOK,
  MessagePlatform.INSTAGRAM,
  MessagePlatform.FACEBOOK,
  MessagePlatform.X_TWITTER,
  MessagePlatform.SMS,
];

export function MessageSidebar({
  connectedAccounts,
  onConnectAccount,
  onConnectAlias,
  selectedAccountId,
  onAccountSelect,
}: MessageSidebarProps) {
  const groupedAccounts = connectedAccounts.reduce((acc, account) => {
    if (!acc[account.platform]) {
      acc[account.platform] = [];
    }
    acc[account.platform].push(account);
    return acc;
  }, {} as Record<MessagePlatform, ConnectedAccount[]>);

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">Microsoft Personal Mail</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConnectAlias?.('hotmail')}
              className="justify-start"
            >
              Hotmail
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onConnectAlias?.('msn')}
              className="justify-start"
            >
              MSN
            </Button>
          </div>
        </div>

        {connectablePlatforms.map((platform) => {
          const accounts = groupedAccounts[platform] || [];
          const PlatformIcon = platformIcons[platform] || Mail;

          return (
            <div key={platform} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  {platformLabels[platform]}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onConnectAccount(platform)}
                  className="h-6 w-6"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {accounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => onAccountSelect(account.id)}
                  className={`w-full flex items-center space-x-2 p-2 rounded-md text-sm ${
                    selectedAccountId === account.id
                      ? 'bg-gray-200'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <PlatformIcon className="h-4 w-4 text-gray-500" />
                  <span className="truncate">
                    {account.accountId}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
} 