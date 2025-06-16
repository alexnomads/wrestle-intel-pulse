import { supabase } from '@/integrations/supabase/client';
import { NewsItem } from '@/services/data/dataTypes';
import { WrestlerAnalysis, WrestlerMention } from '@/types/wrestlerAnalysis';
import { isWrestlerMentioned } from '@/services/analysis/wrestlerNameMatcher';
import { analyzeSentiment } from '@/services/data/sentimentAnalysisService';

interface RawWrestlerMetric {
  wrestler_id: string;
  push_score: number;
  burial_score: number;
  momentum_score: number;
  popularity_score: number;
  mention_count: number;
  confidence_level: 'high' | 'medium' | 'low';
  data_sources: {
    total_mentions: number;
    tier_1_mentions: number;
    tier_2_mentions: number;
    tier_3_mentions: number;
    hours_since_last_mention: number;
    source_breakdown: Record<string, number>;
  };
}

export const analyzeWrestlerMentions = async (
  wrestlers: any[],
  newsItems: NewsItem[]
): Promise<WrestlerAnalysis[]> => {
  console.log('🚀 Starting enhanced wrestler analysis...', {
    wrestlersCount: wrestlers.length,
    newsItemsCount: newsItems.length
  });

  if (wrestlers.length === 0 || newsItems.length === 0) {
    console.log('⚠️ No wrestlers or news items provided');
    return [];
  }

  // Debug: Show sample news items
  console.log('📰 Sample news items:', newsItems.slice(0, 3).map(item => ({
    title: item.title,
    snippet: item.contentSnippet?.substring(0, 100),
    link: item.link
  })));

  const analyses: WrestlerAnalysis[] = [];
  const mentionsToStore: any[] = [];
  let totalProcessed = 0;
  let totalWithMentions = 0;

  for (const wrestler of wrestlers) {
    totalProcessed++;
    console.log(`\n🔍 [${totalProcessed}/${wrestlers.length}] Analyzing wrestler: ${wrestler.name}`);
    
    const relatedNews = newsItems.filter(item => {
      const content = `${item.title} ${item.contentSnippet || ''}`;
      const isMatched = isWrestlerMentioned(wrestler.name, content);
      if (isMatched) {
        console.log(`  📰 Matched article: "${item.title}" - Link: ${item.link || 'No link'}`);
      }
      return isMatched;
    });

    console.log(`  📊 Found ${relatedNews.length} related articles for ${wrestler.name}`);

    if (relatedNews.length === 0) {
      console.log(`  ❌ No mentions found for ${wrestler.name}`);
      continue;
    }

    totalWithMentions++;

    // Generate mentions for storage with proper URLs
    const mentions = relatedNews.map(item => {
      const sentimentAnalysis = analyzeSentiment(item.title + ' ' + (item.contentSnippet || ''));
      return {
        wrestler_id: wrestler.id,
        wrestler_name: wrestler.name,
        source_type: 'news',
        source_name: item.source || 'Wrestling News',
        source_url: item.link || '#',
        title: item.title,
        content_snippet: item.contentSnippet || item.title.substring(0, 150),
        mention_context: 'news_article',
        sentiment_score: sentimentAnalysis.score,
        source_credibility_tier: 2,
        keywords: JSON.stringify([wrestler.name])
      };
    });

    mentionsToStore.push(...mentions);

    // Calculate enhanced metrics
    const sentimentScores = mentions.map(m => m.sentiment_score);
    const avgSentiment = sentimentScores.reduce((sum, score) => sum + score, 0) / sentimentScores.length;
    
    // More realistic scoring algorithm
    const baseScore = Math.round(avgSentiment * 100);
    const mentionBonus = Math.min(relatedNews.length * 5, 30); // Cap bonus at 30
    
    const pushScore = Math.min(100, Math.max(0, baseScore + mentionBonus));
    const burialScore = Math.min(100, Math.max(0, (100 - baseScore) * 0.7)); // Less aggressive burial scoring
    const momentumScore = Math.round(Math.min(100, pushScore * 0.8 + relatedNews.length * 3));
    const popularityScore = Math.round(Math.min(100, (pushScore + mentionBonus) * 0.9));

    console.log(`  📈 Metrics for ${wrestler.name}:`, {
      mentions: relatedNews.length,
      avgSentiment: Math.round(avgSentiment * 100),
      pushScore,
      burialScore,
      momentumScore,
      popularityScore
    });

    const analysis: WrestlerAnalysis = {
      id: wrestler.id,
      wrestler_name: wrestler.name,
      promotion: wrestler.promotions?.name || wrestler.brand || 'Unknown',
      pushScore,
      burialScore,
      momentumScore,
      popularityScore,
      totalMentions: relatedNews.length,
      sentimentScore: Math.round(avgSentiment * 100),
      isChampion: wrestler.is_champion || false,
      championshipTitle: wrestler.championship_title,
      isOnFire: pushScore > 70 || relatedNews.length > 5,
      trend: pushScore > 70 ? 'push' : burialScore > 60 ? 'burial' : 'stable',
      evidence: `Based on ${relatedNews.length} recent news articles with ${Math.round(avgSentiment * 100)}% avg sentiment`,
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

    analyses.push(analysis);
  }

  console.log(`\n✅ Analysis Summary:`, {
    totalProcessed,
    totalWithMentions,
    analysesGenerated: analyses.length,
    mentionsToStore: mentionsToStore.length
  });

  // Store mentions in database
  if (mentionsToStore.length > 0) {
    console.log(`💾 Storing ${mentionsToStore.length} wrestler mentions...`);
    try {
      const { error: mentionsError } = await supabase
        .from('wrestler_mentions_log')
        .insert(mentionsToStore);

      if (mentionsError) {
        console.error('❌ Error storing wrestler mentions:', mentionsError);
      } else {
        console.log('✅ Successfully stored wrestler mentions');
      }
    } catch (error) {
      console.error('❌ Error storing mentions:', error);
    }
  }

  // Store metrics in database with proper JSON conversion
  if (analyses.length > 0) {
    console.log(`💾 Storing ${analyses.length} wrestler metrics...`);
    try {
      const metricsToStore = analyses.map(analysis => ({
        wrestler_id: analysis.id,
        push_score: analysis.pushScore,
        burial_score: analysis.burialScore,
        momentum_score: analysis.momentumScore,
        popularity_score: analysis.popularityScore,
        mention_count: analysis.totalMentions,
        confidence_level: analysis.totalMentions >= 5 ? 'high' : analysis.totalMentions >= 3 ? 'medium' : 'low',
        data_sources: {
          total_mentions: analysis.totalMentions,
          tier_1_mentions: 0,
          tier_2_mentions: analysis.totalMentions,
          tier_3_mentions: 0,
          hours_since_last_mention: 1,
          source_breakdown: analysis.source_breakdown || {}
        } as any
      }));

      const { error: metricsError } = await supabase
        .from('wrestler_metrics_history')
        .insert(metricsToStore);

      if (metricsError) {
        console.error('❌ Error storing wrestler metrics:', metricsError);
      } else {
        console.log('✅ Successfully stored wrestler metrics');
      }
    } catch (error) {
      console.error('❌ Error storing metrics:', error);
    }
  }

  console.log(`🏁 Enhanced wrestler analysis completed`, {
    totalAnalyses: analyses.length,
    topWrestlers: analyses.slice(0, 3).map(a => ({ name: a.wrestler_name, mentions: a.totalMentions, push: a.pushScore }))
  });

  return analyses.sort((a, b) => b.totalMentions - a.totalMentions);
};

export const getStoredWrestlerMetrics = async (): Promise<WrestlerAnalysis[]> => {
  try {
    // First get the metrics
    const { data: metrics, error: metricsError } = await supabase
      .from('wrestler_metrics_history')
      .select('*')
      .order('created_at', { ascending: false });

    if (metricsError) {
      console.error('❌ Error fetching stored metrics:', metricsError);
      return [];
    }

    if (!metrics || metrics.length === 0) {
      console.log('⚠️ No stored wrestler metrics found');
      return [];
    }

    // Then get the wrestlers data separately
    const wrestlerIds = [...new Set(metrics.map(m => m.wrestler_id))];
    const { data: wrestlers, error: wrestlersError } = await supabase
      .from('wrestlers')
      .select('id, name, brand, is_champion, championship_title')
      .in('id', wrestlerIds);

    if (wrestlersError) {
      console.error('❌ Error fetching wrestlers:', wrestlersError);
      return [];
    }

    // Create a map for quick lookup
    const wrestlerMap = new Map();
    wrestlers?.forEach(wrestler => {
      wrestlerMap.set(wrestler.id, wrestler);
    });

    console.log(`📊 Retrieved ${metrics.length} stored wrestler analyses`);

    return metrics.map(metric => {
      const wrestler = wrestlerMap.get(metric.wrestler_id);
      const dataSources = typeof metric.data_sources === 'string' 
        ? JSON.parse(metric.data_sources) 
        : metric.data_sources || {};

      return {
        id: metric.wrestler_id,
        wrestler_name: wrestler?.name || 'Unknown Wrestler',
        promotion: wrestler?.brand || 'Unknown',
        pushScore: metric.push_score,
        burialScore: metric.burial_score,
        momentumScore: metric.momentum_score,
        popularityScore: metric.popularity_score,
        totalMentions: metric.mention_count,
        sentimentScore: Math.round((metric.push_score + (100 - metric.burial_score)) / 2),
        isChampion: wrestler?.is_champion || false,
        championshipTitle: wrestler?.championship_title,
        isOnFire: metric.push_score > 80 || metric.mention_count > 8,
        trend: metric.push_score > 70 ? 'push' : metric.burial_score > 60 ? 'burial' : 'stable',
        evidence: `Based on ${metric.mention_count} recent mentions`,
        change24h: 0,
        relatedNews: [],
        mention_sources: [],
        source_breakdown: (dataSources as any).source_breakdown || {
          news_count: metric.mention_count,
          reddit_count: 0,
          total_sources: metric.mention_count
        }
      };
    });
  } catch (error) {
    console.error('❌ Error in getStoredWrestlerMetrics:', error);
    return [];
  }
};
