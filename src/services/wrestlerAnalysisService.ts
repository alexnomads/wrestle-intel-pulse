
import type { Wrestler, NewsItem, WrestlerAnalysis, WrestlerMention, SourceBreakdown } from '@/types/wrestlerAnalysis';
import { isWrestlerMentioned } from '@/components/dashboard/wrestler-tracker/utils/wrestlerNameMatcher';
import { analyzeSentiment } from '@/services/data/sentimentAnalysisService';

// More realistic mention distribution patterns
const getMentionDistribution = (wrestlerIndex: number, totalWrestlers: number): number => {
  // Create a more realistic distribution curve
  const distributions = [
    { min: 25, max: 50 }, // Top tier wrestlers
    { min: 15, max: 35 }, // Upper mid tier
    { min: 8, max: 25 },  // Mid tier
    { min: 3, max: 15 },  // Lower mid tier
    { min: 1, max: 8 }    // Lower tier
  ];
  
  const tierIndex = Math.floor((wrestlerIndex / totalWrestlers) * distributions.length);
  const tier = distributions[Math.min(tierIndex, distributions.length - 1)];
  
  return Math.floor(Math.random() * (tier.max - tier.min + 1)) + tier.min;
};

// More balanced trend generation
const generateRealisticTrend = (mentionCount: number, sentimentScore: number): 'push' | 'burial' | 'stable' => {
  // Higher mentions generally indicate more activity (push or stable)
  if (mentionCount > 20) {
    return Math.random() < 0.7 ? 'push' : 'stable';
  } else if (mentionCount > 10) {
    const rand = Math.random();
    if (rand < 0.4) return 'push';
    if (rand < 0.8) return 'stable';
    return 'burial';
  } else {
    const rand = Math.random();
    if (rand < 0.3) return 'push';
    if (rand < 0.6) return 'stable';
    return 'burial';
  }
};

// Generate realistic sentiment based on trend
const generateSentimentForTrend = (trend: 'push' | 'burial' | 'stable', baseSentiment: number): number => {
  switch (trend) {
    case 'push':
      return Math.max(baseSentiment, 60 + Math.random() * 30); // 60-90%
    case 'burial':
      return Math.min(baseSentiment, 20 + Math.random() * 30); // 20-50%
    case 'stable':
      return 40 + Math.random() * 40; // 40-80%
  }
};

const generateMockAnalysisForWrestler = (
  wrestler: Wrestler, 
  newsItems: NewsItem[] = [],
  wrestlerIndex: number,
  totalWrestlers: number,
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
    reddit_count: Math.floor(Math.random() * 5), // Mock reddit data for now
    total_sources: mentionSources.length + Math.floor(Math.random() * 5)
  };

  const realMentions = relatedNewsItems.length;
  
  // Use realistic mention distribution
  const baseMentions = realMentions > 0 ? realMentions : getMentionDistribution(wrestlerIndex, totalWrestlers);
  
  // Calculate realistic sentiment
  const baseSentimentScore = realMentions > 0 
    ? mentionSources.reduce((sum, m) => sum + m.sentiment_score, 0) / mentionSources.length
    : Math.random();

  // Generate trend and adjust sentiment accordingly
  const trend = generateRealisticTrend(baseMentions, baseSentimentScore);
  const sentimentScore = generateSentimentForTrend(trend, baseSentimentScore * 100);

  const pushScore = trend === 'push' ? Math.max(minScore, 70 + Math.random() * 30) : 
                   trend === 'stable' ? 40 + Math.random() * 30 : 
                   Math.random() * 40;
  
  const burialScore = trend === 'burial' ? 60 + Math.random() * 30 : 
                     trend === 'stable' ? 20 + Math.random() * 30 : 
                     Math.random() * 30;

  // Generate realistic 24h change based on trend
  const change24h = trend === 'push' ? Math.floor(Math.random() * 25) + 5 :
                   trend === 'burial' ? -(Math.floor(Math.random() * 20) + 5) :
                   Math.floor(Math.random() * 21) - 10; // -10 to +10 for stable
  
  return {
    id: wrestler.id,
    wrestler_name: wrestler.name,
    promotion: wrestler.brand || 'Unknown',
    pushScore,
    burialScore,
    trend,
    totalMentions: baseMentions,
    sentimentScore,
    isChampion: wrestler.is_champion || false,
    championshipTitle: wrestler.championship_title,
    evidence: realMentions > 0 
      ? `Based on ${realMentions} recent news articles`
      : "Generated from trending patterns",
    isOnFire: pushScore > 85 || baseMentions > 30,
    momentumScore: Math.floor((pushScore + baseMentions * 3) / 2),
    popularityScore: Math.floor(pushScore * 0.8 + baseMentions * 2),
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

  if (wrestlers.length === 0) {
    console.log('No wrestlers provided for analysis');
    return [];
  }

  // Shuffle wrestlers to get varied results
  const shuffledWrestlers = [...wrestlers].sort(() => Math.random() - 0.5);

  const analysis = shuffledWrestlers.map((wrestler, index) => 
    generateMockAnalysisForWrestler(wrestler, newsItems, index, shuffledWrestlers.length)
  );

  // Sort by total mentions and momentum, but with some randomization
  const sortedAnalysis = analysis.sort((a, b) => {
    const aScore = a.totalMentions * 10 + a.momentumScore + (Math.random() * 50);
    const bScore = b.totalMentions * 10 + b.momentumScore + (Math.random() * 50);
    return bScore - aScore;
  });

  const result = sortedAnalysis.slice(0, Math.max(minWrestlers, 10));
  
  console.log('Wrestler analysis completed:', {
    totalAnalyzed: result.length,
    withRealMentions: result.filter(w => (w.mention_sources?.length || 0) > 0).length,
    topWrestler: result[0]?.wrestler_name,
    trendBreakdown: {
      push: result.filter(w => w.trend === 'push').length,
      stable: result.filter(w => w.trend === 'stable').length,
      burial: result.filter(w => w.trend === 'burial').length
    }
  });

  return result;
};
