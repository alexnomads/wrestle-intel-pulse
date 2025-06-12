
export interface UnifiedItem {
  id: string;
  title: string;
  content: string;
  source: string;
  type: 'news' | 'reddit' | 'twitter' | 'youtube';
  timestamp: Date;
  link: string;
  sentiment: number;
  credibilityScore: number;
  isBreaking?: boolean;
  engagement?: {
    score?: number;
    comments?: number;
  };
}

export type FilterType = 'all' | 'positive' | 'negative' | 'news' | 'reddit' | 'twitter' | 'youtube';

export interface UnifiedNewsFeedProps {
  refreshTrigger: Date;
}
