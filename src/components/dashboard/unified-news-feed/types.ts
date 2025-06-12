
export interface UnifiedItem {
  id: string;
  title: string;
  content: string;
  source: string;
  type: 'news' | 'reddit';
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

export type FilterType = 'all' | 'positive' | 'negative';

export interface UnifiedNewsFeedProps {
  refreshTrigger: Date;
}
