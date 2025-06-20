
import { NewsItem } from '@/services/data/dataTypes';
import { WrestlerAnalysis, WrestlerMention } from '@/types/wrestlerAnalysis';
import { isWrestlerMentioned } from '@/services/analysis/wrestlerNameMatcher';
import { analyzeSentiment } from '@/services/data/sentimentAnalysisService';
import { calculateWrestlerScores, generateMentionData } from './scoringUtils';

export const analyzeWrestlerForMentions = (
  wrestler: any,
  newsItems: NewsItem[]
): { analysis: WrestlerAnalysis | null; mentions: any[] } => {
  console.log(`\n🔍 Analyzing wrestler: "${wrestler.name}"`);
  
  const relatedNews = newsItems.filter(item => {
    const content = `${item.title} ${item.contentSnippet || ''}`;
    const isMatched = isWrestlerMentioned(wrestler.name, content);
    if (isMatched) {
      console.log(`  ✅ MATCHED: "${item.title.substring(0, 100)}..." - Link: ${item.link || 'No link'}`);
      console.log(`    Content: "${content.substring(0, 200)}..."`);
    }
    return isMatched;
  });

  console.log(`  📊 Found ${relatedNews.length} related articles for "${wrestler.name}"`);

  if (relatedNews.length === 0) {
    console.log(`  ❌ No mentions found for "${wrestler.name}"`);
    return { analysis: null, mentions: [] };
  }

  // Generate mentions for storage with proper URLs
  const mentions = relatedNews.map(item => {
    const sentimentAnalysis = analyzeSentiment(item.title + ' ' + (item.contentSnippet || ''));
    return generateMentionData(wrestler, item, sentimentAnalysis.score);
  });

  // Calculate enhanced metrics
  const sentimentScores = mentions.map(m => m.sentiment_score);
  const scores = calculateWrestlerScores(sentimentScores, relatedNews.length);

  console.log(`  📈 Metrics for "${wrestler.name}":`, {
    mentions: relatedNews.length,
    avgSentiment: Math.round(scores.avgSentiment * 100),
    pushScore: scores.pushScore,
    burialScore: scores.burialScore,
    momentumScore: scores.momentumScore,
    popularityScore: scores.popularityScore
  });

  const analysis: WrestlerAnalysis = {
    id: wrestler.id,
    wrestler_name: wrestler.name,
    promotion: wrestler.promotions?.name || wrestler.brand || 'Unknown',
    pushScore: scores.pushScore,
    burialScore: scores.burialScore,
    momentumScore: scores.momentumScore,
    popularityScore: scores.popularityScore,
    totalMentions: relatedNews.length,
    sentimentScore: Math.round(scores.avgSentiment * 100),
    isChampion: wrestler.is_champion || false,
    championshipTitle: wrestler.championship_title,
    isOnFire: scores.pushScore > 70 || relatedNews.length > 5,
    trend: scores.pushScore > 70 ? 'push' : scores.burialScore > 60 ? 'burial' : 'stable',
    evidence: `Based on ${relatedNews.length} recent news articles with ${Math.round(scores.avgSentiment * 100)}% avg sentiment`,
    change24h: Math.round((Math.random() - 0.5) * 20),
    relatedNews: relatedNews.slice(0, 5).map(item => ({
      title: item.title,
      link: item.link || '#',
      source: item.source || 'Wrestling News',
      pubDate: item.pubDate,
      contentSnippet: item.contentSnippet
    })),
    mention_sources: mentions.map(m => ({
      id: `mention-${wrestler.id}-${Date.now()}-${Math.random()}`,
      wrestler_name: wrestler.name,
      source_type: 'news' as const,
      source_name: m.source_name,
      title: m.title,
      url: m.source_url,
      content_snippet: m.content_snippet,
      timestamp: new Date(),
      sentiment_score: m.sentiment_score
    })),
    source_breakdown: {
      news_count: mentions.length,
      reddit_count: 0,
      total_sources: mentions.length
    }
  };

  return { analysis, mentions };
};
