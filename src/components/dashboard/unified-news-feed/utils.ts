import { analyzeSentiment } from "@/services/wrestlingDataService";
import { UnifiedItem, FilterType } from "./types";

export const getCredibilityScore = (source: string): number => {
  const reliableSources = ['wrestling observer', 'pwinsider', 'fightful', 'wrestling inc'];
  const moderateSources = ['wrestling news', 'sescoops', 'ringside news'];
  
  const lowerSource = source.toLowerCase();
  if (reliableSources.some(reliable => lowerSource.includes(reliable))) return 90;
  if (moderateSources.some(moderate => lowerSource.includes(moderate))) return 70;
  if (lowerSource.includes('reddit')) return 60;
  return 50;
};

export const isBreakingNews = (title: string, timestamp: Date): boolean => {
  const breakingKeywords = ['breaking', 'fired', 'released', 'injured', 'returns', 'debuts', 'champion'];
  const hoursOld = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
  return hoursOld < 2 && breakingKeywords.some(keyword => title.toLowerCase().includes(keyword));
};

export const getSentimentBadge = (sentiment: number) => {
  if (sentiment > 0.7) return { label: 'Positive', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' };
  if (sentiment > 0.3) return { label: 'Neutral', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' };
  return { label: 'Negative', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' };
};

export const getCredibilityBadge = (score: number) => {
  if (score >= 80) return { label: 'High', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' };
  if (score >= 60) return { label: 'Medium', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' };
  return { label: 'Low', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' };
};

export const formatTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return "Less than 1h ago";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

export const handleItemClick = (link: string, title: string, type: 'news' | 'reddit'): void => {
  console.log(`Opening ${type} item:`, title, 'Link:', link);
  
  let finalUrl = link;
  if (type === 'reddit' && !link.startsWith('http')) {
    finalUrl = `https://reddit.com${link}`;
  }
  
  if (finalUrl && finalUrl !== '#') {
    try {
      window.open(finalUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to open link:', error);
      window.location.href = finalUrl;
    }
  } else {
    console.warn('No valid link for item:', title);
    alert('Sorry, no link is available for this item.');
  }
};

export const createUnifiedItems = (newsItems: any[], redditPosts: any[]): UnifiedItem[] => {
  const unifiedItems: UnifiedItem[] = [
    ...newsItems.map((item, index) => {
      const sentiment = analyzeSentiment(item.title + ' ' + item.contentSnippet);
      return {
        id: `news-${index}`,
        title: item.title,
        content: item.contentSnippet,
        source: item.source || 'Wrestling News',
        type: 'news' as const,
        timestamp: new Date(item.pubDate),
        link: item.link || '#',
        sentiment: sentiment.score,
        credibilityScore: getCredibilityScore(item.source || ''),
        isBreaking: isBreakingNews(item.title, new Date(item.pubDate))
      };
    }),
    ...redditPosts.map((post, index) => {
      const sentiment = analyzeSentiment(post.title + ' ' + post.selftext);
      return {
        id: `reddit-${index}`,
        title: post.title,
        content: post.selftext || 'Discussion thread',
        source: `r/${post.subreddit}`,
        type: 'reddit' as const,
        timestamp: new Date(post.created_utc * 1000),
        link: `https://reddit.com${post.permalink}`,
        sentiment: sentiment.score,
        credibilityScore: getCredibilityScore('reddit'),
        engagement: {
          score: post.score,
          comments: post.num_comments
        }
      };
    })
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  return unifiedItems;
};

export const filterItems = (items: UnifiedItem[], filter: FilterType): UnifiedItem[] => {
  return items.filter(item => {
    // Content type filters
    if (filter === 'news' && item.type !== 'news') return false;
    if (filter === 'reddit' && item.type !== 'reddit') return false;
    if (filter === 'twitter' && item.type !== 'twitter') return false;
    if (filter === 'youtube' && item.type !== 'youtube') return false;
    
    // Sentiment filters
    if (filter === 'positive' && item.sentiment <= 0.6) return false;
    if (filter === 'negative' && item.sentiment >= 0.4) return false;
    
    return true;
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};
