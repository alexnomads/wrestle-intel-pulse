
export interface CommunityHotTopicsProps {
  refreshTrigger: Date;
}

export type ViewPeriod = 'daily' | 'weekly' | 'monthly';

export interface TrendSummary {
  totalEngagement: number;
  avgSentiment: number;
  hotTopics: number;
  topCommunity: string;
}
