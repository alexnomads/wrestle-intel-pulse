
import { useState, useEffect } from 'react';
import { TwitterAccount, WRESTLING_ACCOUNTS } from '@/constants/wrestlingAccounts';
import { processTwitterData } from '../utils';
import { useFreeWrestlingSocial } from '@/hooks/useFreeWrestlingSocial';

export const useTopTweetsState = () => {
  const [accounts, setAccounts] = useState<TwitterAccount[]>(WRESTLING_ACCOUNTS);
  const [filterType, setFilterType] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [newAccount, setNewAccount] = useState({ 
    username: '', 
    displayName: '', 
    type: 'wrestler' as const 
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataStatus, setDataStatus] = useState<'live' | 'fallback' | 'mixed'>('live');
  const [tweets, setTweets] = useState([]);

  const { data: freeWrestlingData = [], isLoading, error } = useFreeWrestlingSocial();

  useEffect(() => {
    if (freeWrestlingData.length > 0) {
      // Convert FreeSocialPost to the format expected by processTwitterData
      const convertedData = freeWrestlingData.map(post => ({
        id: post.id,
        text: post.text,
        author: post.author,
        timestamp: post.timestamp,
        engagement: {
          likes: post.engagement.likes,
          retweets: post.engagement.retweets,
          replies: post.engagement.replies
        },
        url: post.original_url,
        isFallback: post.text.includes('🔄') || post.text.includes('📱') || post.text.includes('🆓')
      }));

      const { tweets: processedTweets, dataStatus: status } = processTwitterData(convertedData, accounts);
      setTweets(processedTweets);
      setDataStatus(status);
      setLastUpdated(new Date());
    }
  }, [freeWrestlingData, accounts]);

  const addAccount = () => {
    if (newAccount.username && newAccount.displayName) {
      setAccounts([...accounts, { 
        ...newAccount, 
        active: true, 
        priority: 'low',
        verified: false 
      }]);
      setNewAccount({ username: '', displayName: '', type: 'wrestler' });
      setShowAddForm(false);
    }
  };

  const removeAccount = (username: string) => {
    setAccounts(accounts.filter(acc => acc.username !== username));
  };

  const toggleAccount = (username: string) => {
    setAccounts(accounts.map(acc => 
      acc.username === username ? { ...acc, active: !acc.active } : acc
    ));
  };

  const updateNewAccount = (field: string, value: string) => {
    setNewAccount(prev => ({ ...prev, [field]: value }));
  };

  const filteredTweets = filterType === 'all' 
    ? tweets 
    : tweets.filter((tweet: any) => tweet.account_type === filterType);

  return {
    // State
    accounts,
    filterType,
    showSettings,
    newAccount,
    showAddForm,
    lastUpdated,
    dataStatus,
    tweets: filteredTweets,
    isLoading,
    error,
    
    // Actions
    setFilterType,
    setShowSettings,
    setShowAddForm,
    addAccount,
    removeAccount,
    toggleAccount,
    updateNewAccount
  };
};
