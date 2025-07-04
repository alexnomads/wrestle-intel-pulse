
import { NewsItem } from '@/services/data/dataTypes';
import { WrestlerAnalysis } from '@/types/wrestlerAnalysis';
import { analyzeWrestlerMentionsInNews } from './mentionAnalyzer';
import { calculatePushBurialScores } from './scoringUtils';
import { storeWrestlerMetrics, getStoredWrestlerMetrics } from './databaseOperations';

export const analyzeWrestlerMentions = async (wrestlers: any[], newsItems: NewsItem[]): Promise<WrestlerAnalysis[]> => {
  console.log('🔍 Starting wrestler mention analysis', {
    wrestlers: wrestlers.length,
    newsItems: newsItems.length
  });

  const analyses: WrestlerAnalysis[] = [];

  for (const wrestler of wrestlers) {
    const wrestlerName = wrestler.name || wrestler.wrestler_name;
    
    // Get the promotion from the wrestler data (from Supabase) - prioritize promotions.name
    const promotion = wrestler.promotions?.name || wrestler.promotion || wrestler.brand || 'Unknown';
    
    console.log(`🔎 Analyzing wrestler: ${wrestlerName} (${promotion})`);
    
    if (!wrestlerName) {
      console.warn('⚠️ Skipping wrestler with no name:', wrestler);
      continue;
    }

    // Analyze mentions in news
    const mentionResults = analyzeWrestlerMentionsInNews(wrestlerName, newsItems);
    
    if (mentionResults.totalMentions > 0) {
      // Calculate scores based on mentions
      const scores = calculatePushBurialScores(mentionResults.mentions, mentionResults.sentimentScore);
      
      const analysis: WrestlerAnalysis = {
        id: wrestler.id || `${wrestlerName.replace(/\s+/g, '-').toLowerCase()}`,
        wrestler_name: wrestlerName,
        promotion: promotion, // Use the correct promotion from wrestler data
        pushScore: scores.pushScore,
        burialScore: scores.burialScore,
        trend: scores.trend,
        totalMentions: mentionResults.totalMentions,
        sentimentScore: mentionResults.sentimentScore,
        isChampion: wrestler.is_champion || false,
        championshipTitle: wrestler.championship_title || null,
        evidence: mentionResults.evidence,
        isOnFire: scores.pushScore >= 70 && mentionResults.totalMentions >= 5,
        momentumScore: Math.round((scores.pushScore + mentionResults.sentimentScore) / 2),
        popularityScore: Math.min(100, mentionResults.totalMentions * 10),
        change24h: Math.floor(Math.random() * 20) - 10, // Placeholder
        relatedNews: mentionResults.relatedNews,
        mention_sources: mentionResults.mentions.map(m => ({
          id: `mention-${wrestler.id}-${Date.now()}-${Math.random()}`,
          wrestler_name: wrestlerName,
          source_type: 'news' as const,
          source_name: m.source_name,
          title: m.title,
          url: m.url,
          content_snippet: m.content_snippet,
          timestamp: m.timestamp,
          sentiment_score: m.sentiment_score
        })),
        source_breakdown: {
          news_count: mentionResults.mentions.length,
          reddit_count: 0,
          total_sources: mentionResults.mentions.length
        }
      };

      analyses.push(analysis);
      console.log(`✅ Analysis complete for ${wrestlerName}: ${mentionResults.totalMentions} mentions, ${scores.pushScore} push score`);
    } else {
      console.log(`➡️ No mentions found for ${wrestlerName}`);
    }
  }

  // Save to database using the correct function name
  try {
    await storeWrestlerMetrics(analyses);
    console.log('💾 Wrestler metrics saved to database');
  } catch (error) {
    console.error('❌ Error saving wrestler metrics:', error);
  }

  console.log(`🎯 Analysis complete: ${analyses.length} wrestlers with mentions found`);
  return analyses;
};

export { getStoredWrestlerMetrics };
