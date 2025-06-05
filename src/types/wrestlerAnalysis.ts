
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
  relatedNews: Array<{
    title: string;
    link: string;
    source: string;
    pubDate: string;
  }>;
}
