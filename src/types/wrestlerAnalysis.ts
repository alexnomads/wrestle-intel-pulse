
export interface NewsItem {
  title: string;
  contentSnippet: string;
  pubDate: string;
  link?: string;
  source?: string;
}

export interface Wrestler {
  id: string;
  name: string;
  brand?: string;
  promotion_id?: string;
  is_champion?: boolean;
  championship_title?: string;
}

export interface WrestlerMention {
  id: string;
  wrestler_name: string;
  source_type: 'news' | 'reddit';
  source_name: string;
  title: string;
  url: string;
  content_snippet: string;
  timestamp: Date;
  sentiment_score: number;
}

export interface SourceBreakdown {
  news_count: number;
  reddit_count: number;
  total_sources: number;
}

export interface WrestlerAnalysis {
  id: string;
  wrestler_name: string;
  promotion: string;
  pushScore: number;
  burialScore: number;
  trend: 'push' | 'burial' | 'stable';
  totalMentions: number;
  sentimentScore: number;
  isChampion: boolean;
  championshipTitle: string | null;
  evidence: string;
  isOnFire: boolean;
  momentumScore: number;
  popularityScore: number;
  change24h: number;
  relatedNews: Array<{
    title: string;
    link: string;
    source: string;
    pubDate: string;
  }>;
  mention_sources?: WrestlerMention[];
  source_breakdown?: SourceBreakdown;
}
