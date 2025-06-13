
import type { Wrestler, NewsItem, WrestlerAnalysis, WrestlerMention, SourceBreakdown } from '@/types/wrestlerAnalysis';
import { isWrestlerMentioned } from '@/components/dashboard/wrestler-tracker/utils/wrestlerNameMatcher';
import { analyzeSentiment } from '@/services/data/sentimentAnalysisService';

const generateAnalysisForWrestlerWithRealMentions = (
  wrestler: Wrestler, 
  newsItems: NewsItem[] = []
): WrestlerAnalysis | null => {
  // Find real news items that mention this wrestler
  const relatedNewsItems = newsItems.filter(item => {
    const content = `${item.title} ${item.contentSnippet || ''}`;
    return isWrestlerMentioned(wrestler.name, content);
  });

  // Only proceed if we have real mentions
  if (relatedNewsItems.length === 0) {
    return null;
  }

  // Generate mention sources from real news data only
  const mentionSources: WrestlerMention[] = relatedNewsItems.map(item => ({
    id: `${wrestler.id}-${item.title.substring(0, 10)}`,
    wrestler_name: wrestler.name,
    source_type: 'news' as const,
    source_name: item.source || 'Wrestling News',
    title: item.title,
    url: item.link || '#',
    content_snippet: item.contentSnippet || item.title.substring(0, 150) + '...',
    timestamp: new Date(item.pubDate),
    sentiment_score: analyzeSentiment(item.title + ' ' + (item.contentSnippet || '')).score
  }));

  // Calculate source breakdown from real data
  const sourceBreakdown: SourceBreakdown = {
    news_count: mentionSources.length,
    reddit_count: 0, // Real reddit integration would go here
    total_sources: mentionSources.length
  };

  const realMentions = relatedNewsItems.length;
  
  // Calculate real sentiment from actual mentions
  const sentimentScore = mentionSources.reduce((sum, m) => sum + m.sentiment_score, 0) / mentionSources.length * 100;

  // Determine trend based on real sentiment and mention volume
  let trend: 'push' | 'burial' | 'stable';
  if (sentimentScore > 70 && realMentions >= 3) {
    trend = 'push';
  } else if (sentimentScore < 40 && realMentions >= 2) {
    trend = 'burial';
  } else {
    trend = 'stable';
  }

  // Calculate scores based on real data
  const pushScore = Math.max(30, sentimentScore * (realMentions / 10 + 0.5));
  const burialScore = Math.max(10, (100 - sentimentScore) * (realMentions / 10 + 0.3));

  // Calculate 24h change based on recent vs older mentions
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentMentions = relatedNewsItems.filter(item => new Date(item.pubDate) > yesterday);
  const change24h = recentMentions.length > 0 ? 
    Math.round((recentMentions.length / relatedNewsItems.length) * 100 - 50) : 0;
  
  return {
    id: wrestler.id,
    wrestler_name: wrestler.name,
    promotion: wrestler.brand || 'Unknown',
    pushScore,
    burialScore,
    trend,
    totalMentions: realMentions,
    sentimentScore,
    isChampion: wrestler.is_champion || false,
    championshipTitle: wrestler.championship_title,
    evidence: `Based on ${realMentions} recent news articles`,
    isOnFire: pushScore > 85 || realMentions > 10,
    momentumScore: Math.floor((pushScore + realMentions * 5) / 2),
    popularityScore: Math.floor(pushScore * 0.8 + realMentions * 3),
    change24h,
    relatedNews: relatedNewsItems.slice(0, 3).map(item => ({
      title: item.title,
      link: item.link || '#',
      source: item.source || 'Wrestling News',
      pubDate: item.pubDate
    })),
    mention_sources: mentionSources,
    source_breakdown: sourceBreakdown
  };
};

export const performWrestlerAnalysis = (
  wrestlers: Wrestler[], 
  newsItems: NewsItem[] = [],
  minWrestlers: number = 5
): WrestlerAnalysis[] => {
  console.log('performWrestlerAnalysis called with:', {
    wrestlersCount: wrestlers.length,
    newsItemsCount: newsItems.length,
    minWrestlers
  });

  if (wrestlers.length === 0 || newsItems.length === 0) {
    console.log('No wrestlers or news items provided for analysis');
    return [];
  }

  // Only analyze wrestlers that have real mentions
  const analysis: WrestlerAnalysis[] = [];
  
  for (const wrestler of wrestlers) {
    const wrestlerAnalysis = generateAnalysisForWrestlerWithRealMentions(wrestler, newsItems);
    if (wrestlerAnalysis) {
      analysis.push(wrestlerAnalysis);
    }
  }

  // Sort by total mentions and momentum
  const sortedAnalysis = analysis.sort((a, b) => {
    const aScore = a.totalMentions * 10 + a.momentumScore;
    const bScore = b.totalMentions * 10 + b.momentumScore;
    return bScore - aScore;
  });

  console.log('Real wrestler analysis completed:', {
    totalAnalyzed: sortedAnalysis.length,
    withRealMentions: sortedAnalysis.length,
    topWrestler: sortedAnalysis[0]?.wrestler_name,
    trendBreakdown: {
      push: sortedAnalysis.filter(w => w.trend === 'push').length,
      stable: sortedAnalysis.filter(w => w.trend === 'stable').length,
      burial: sortedAnalysis.filter(w => w.trend === 'burial').length
    }
  });

  return sortedAnalysis;
};
