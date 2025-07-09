import { ConnectedAccount, MessagePlatform } from '@prisma/client';
import { Mail, Instagram, Facebook, Twitter, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

type MessageSidebarProps = {
  connectedAccounts: ConnectedAccount[];
  onConnectAccount: (platform: MessagePlatform) => void;
  selectedAccountId?: string;
  onAccountSelect: (accountId: string) => void;
};

const platformIcons = {
  [MessagePlatform.EMAIL]: Mail,
  [MessagePlatform.INSTAGRAM]: Instagram,
  [MessagePlatform.FACEBOOK]: Facebook,
  [MessagePlatform.X_TWITTER]: Twitter,
};

const platformLabels = {
  [MessagePlatform.EMAIL]: 'Email',
  [MessagePlatform.INSTAGRAM]: 'Instagram',
  [MessagePlatform.FACEBOOK]: 'Facebook',
  [MessagePlatform.X_TWITTER]: 'Twitter',
};

export function MessageSidebar({
  connectedAccounts,
  onConnectAccount,
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
        {Object.entries(MessagePlatform).map(([key, platform]) => {
          const accounts = groupedAccounts[platform] || [];
          const PlatformIcon = platformIcons[platform];

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
                    {account.username || account.email}
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