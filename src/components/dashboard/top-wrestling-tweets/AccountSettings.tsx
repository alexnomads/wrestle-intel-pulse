
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, X } from 'lucide-react';
import { TwitterAccount } from '@/constants/wrestlingAccounts';
import { getTypeColor } from './utils';

interface AccountSettingsProps {
  accounts: TwitterAccount[];
  showAddForm: boolean;
  newAccount: { username: string; displayName: string; type: 'wrestler' | 'federation' | 'journalist' | 'insider' | 'legend' | 'community' };
  onToggleAddForm: () => void;
  onNewAccountChange: (field: string, value: string) => void;
  onAddAccount: () => void;
  onToggleAccount: (username: string) => void;
  onRemoveAccount: (username: string) => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({
  accounts,
  showAddForm,
  newAccount,
  onToggleAddForm,
  onNewAccountChange,
  onAddAccount,
  onToggleAccount,
  onRemoveAccount
}) => {
  const activeAccountsCount = accounts.filter(acc => acc.active).length;

  return (
    <div className="bg-secondary/30 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center">
          <Users className="h-4 w-4 mr-2" />
          Account Management ({activeAccountsCount} active of {accounts.length} total)
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleAddForm}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Account
        </Button>
      </div>

      {showAddForm && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-background rounded border">
          <input
            type="text"
            placeholder="Username"
            value={newAccount.username}
            onChange={(e) => onNewAccountChange('username', e.target.value)}
            className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Display name"
            value={newAccount.displayName}
            onChange={(e) => onNewAccountChange('displayName', e.target.value)}
            className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={newAccount.type}
            onChange={(e) => onNewAccountChange('type', e.target.value)}
            className="px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="wrestler">Wrestler</option>
            <option value="federation">Federation</option>
            <option value="journalist">Journalist</option>
            <option value="insider">Insider</option>
            <option value="legend">Legend</option>
            <option value="community">Community</option>
          </select>
          <Button onClick={onAddAccount}>Add</Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        {accounts.slice(0, 20).map((account) => (
          <div
            key={account.username}
            className={`flex items-center space-x-2 px-3 py-1 rounded-full border transition-all ${
              account.active 
                ? 'border-blue-500/50 bg-blue-500/10' 
                : 'border-border bg-secondary/50 opacity-60'
            }`}
          >
            <Badge variant="outline" className={getTypeColor(account.type)}>
              {account.type}
            </Badge>
            <span className="text-sm">@{account.username}</span>
            {account.verified && <span className="text-blue-500">✓</span>}
            <button
              onClick={() => onToggleAccount(account.username)}
              className={`w-3 h-3 rounded-full ${
                account.active ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
            <button
              onClick={() => onRemoveAccount(account.username)}
              className="text-red-500 hover:text-red-700"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {accounts.length > 20 && (
          <Badge variant="outline" className="text-xs">
            +{accounts.length - 20} more accounts
          </Badge>
        )}
      </div>
    </div>
  );
};

export default AccountSettings;
