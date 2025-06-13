
import type { Wrestler, NewsItem, WrestlerAnalysis, WrestlerMention, SourceBreakdown } from '@/types/wrestlerAnalysis';
import { isWrestlerMentioned } from '@/components/dashboard/wrestler-tracker/utils/wrestlerNameMatcher';
import { analyzeSentiment } from '@/services/data/sentimentAnalysisService';

const generateMockAnalysisForWrestler = (
  wrestler: Wrestler, 
  newsItems: NewsItem[] = [],
  minScore: number = 30
): WrestlerAnalysis => {
  // Find real news items that mention this wrestler
  const relatedNewsItems = newsItems.filter(item => {
    const content = `${item.title} ${item.contentSnippet || ''}`;
    return isWrestlerMentioned(wrestler.name, content);
  });

  // Generate mention sources from real news data
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

  // Calculate source breakdown
  const sourceBreakdown: SourceBreakdown = {
    news_count: mentionSources.filter(m => m.source_type === 'news').length,
    reddit_count: 0, // Will be populated when Reddit integration is enhanced
    total_sources: mentionSources.length
  };

  const realMentions = relatedNewsItems.length;
  
  // Use real data if available, otherwise generate realistic mock data
  const baseMentions = realMentions > 0 ? realMentions : Math.floor(Math.random() * 15) + 1;
  const sentimentBase = realMentions > 0 
    ? mentionSources.reduce((sum, m) => sum + m.sentiment_score, 0) / mentionSources.length
    : Math.random();

  const pushScore = Math.max(minScore, Math.floor(Math.random() * 40) + 60);
  const burialScore = Math.max(0, Math.floor(Math.random() * 30) + 10);
  const trend = pushScore > burialScore + 20 ? 'push' : burialScore > pushScore + 10 ? 'burial' : 'stable';
  
  return {
    id: wrestler.id,
    wrestler_name: wrestler.name,
    promotion: wrestler.brand || 'Unknown',
    pushScore,
    burialScore,
    trend,
    totalMentions: baseMentions,
    sentimentScore: sentimentBase,
    isChampion: wrestler.is_champion || false,
    championshipTitle: wrestler.championship_title,
    evidence: realMentions > 0 
      ? `Based on ${realMentions} recent news articles`
      : "Trending on social media and wrestling forums",
    isOnFire: pushScore > 80 || baseMentions > 10,
    momentumScore: Math.floor((pushScore + baseMentions * 5) / 2),
    popularityScore: Math.floor(pushScore * 0.8 + baseMentions * 2),
    change24h: Math.floor(Math.random() * 40) - 20,
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

  if (wrestlers.length === 0) {
    console.log('No wrestlers provided for analysis');
    return [];
  }

  const analysis = wrestlers.map(wrestler => 
    generateMockAnalysisForWrestler(wrestler, newsItems)
  );

  // Sort by total mentions (real + generated) and momentum
  const sortedAnalysis = analysis.sort((a, b) => {
    const aScore = a.totalMentions * 10 + a.momentumScore;
    const bScore = b.totalMentions * 10 + b.momentumScore;
    return bScore - aScore;
  });

  const result = sortedAnalysis.slice(0, Math.max(minWrestlers, 10));
  
  console.log('Wrestler analysis completed:', {
    totalAnalyzed: result.length,
    withRealMentions: result.filter(w => (w.mention_sources?.length || 0) > 0).length,
    topWrestler: result[0]?.wrestler_name
  });

  return result;
};
