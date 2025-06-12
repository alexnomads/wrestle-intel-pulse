
import type { NewsItem, WrestlerAnalysis } from '@/types/wrestlerAnalysis';

export interface ProcessedNewsContent {
  content: string;
  item: NewsItem;
  sentiment: { score: number };
}

export const calculateWrestlerMetrics = (
  wrestlerName: string,
  wrestlerId: string,
  relatedNews: NewsItem[],
  totalSentiment: number,
  mentions: number,
  pushScore: number,
  burialScore: number,
  wrestler: any
): WrestlerAnalysis => {
  const avgSentiment = totalSentiment / mentions;
  
  let trend: 'push' | 'burial' | 'stable' = 'stable';
  const pushPercentage = Math.min((pushScore / mentions) * 100, 100);
  const burialPercentage = Math.min((burialScore / mentions) * 100, 100);
  
  if (mentions >= 1) {
    if (pushPercentage > burialPercentage && (pushPercentage > 2 || avgSentiment > 0.55)) {
      trend = 'push';
    } else if (burialPercentage > pushPercentage && (burialPercentage > 2 || avgSentiment < 0.45)) {
      trend = 'burial';
    }
  }
  
  const momentumScore = mentions * (avgSentiment * 2) + (pushPercentage - burialPercentage);
  const isOnFire = mentions >= 2 && avgSentiment > 0.6 && pushPercentage > 15;
  const popularityScore = Math.round(mentions * 10 + (avgSentiment * 50));
  const change24h = trend === 'push' ? Math.round(pushPercentage / 2) : 
                   trend === 'burial' ? -Math.round(burialPercentage / 2) : 
                   Math.round((Math.random() - 0.5) * 10);
  
  return {
    id: wrestlerId,
    wrestler_name: wrestlerName,
    promotion: wrestler.brand || 'Unknown',
    pushScore: pushPercentage,
    burialScore: burialPercentage,
    trend,
    totalMentions: mentions,
    sentimentScore: Math.round(avgSentiment * 100),
    isChampion: wrestler.is_champion || false,
    championshipTitle: wrestler.championship_title || null,
    evidence: mentions > 5 ? 'High Media Coverage' :
             mentions > 2 ? 'Moderate Coverage' : 'Limited Coverage',
    isOnFire,
    momentumScore,
    popularityScore,
    change24h,
    relatedNews: relatedNews.slice(0, 10).map(news => ({
      title: news.title,
      link: news.link || '#',
      source: news.source || 'Unknown',
      pubDate: news.pubDate
    }))
  };
};

export const calculateSentimentScores = (
  content: string,
  sentiment: { score: number }
): { pushScore: number; burialScore: number } => {
  let pushScore = 0;
  let burialScore = 0;
  
  // Enhanced scoring for push/burial indicators
  if (sentiment.score > 0.6) {
    let multiplier = 1;
    if (content.includes('champion') || content.includes('title')) multiplier = 1.5;
    if (content.includes('main event')) multiplier = 1.3;
    if (content.includes('winner') || content.includes('victory')) multiplier = 1.2;
    pushScore += (sentiment.score - 0.5) * 2 * multiplier;
  }
  
  if (sentiment.score < 0.4) {
    let multiplier = 1;
    if (content.includes('fired') || content.includes('released')) multiplier = 2;
    if (content.includes('buried') || content.includes('jobber')) multiplier = 1.8;
    if (content.includes('lose') || content.includes('defeat')) multiplier = 1.3;
    burialScore += (0.5 - sentiment.score) * 2 * multiplier;
  }
  
  return { pushScore, burialScore };
};
