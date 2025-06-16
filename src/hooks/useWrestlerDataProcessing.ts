
import { useState, useEffect } from 'react';
import { NewsItem } from '@/services/data/dataTypes';
import { useWrestlerAnalysis } from './useWrestlerAnalysis';

export const useWrestlerDataProcessing = (wrestlers: any[], newsItems: NewsItem[]) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessTime, setLastProcessTime] = useState<Date | null>(null);
  const [hasInitialData, setHasInitialData] = useState(false);

  console.log('🔄 useWrestlerDataProcessing hook called', {
    wrestlersCount: wrestlers.length,
    newsItemsCount: newsItems.length
  });

  // Use the enhanced wrestler analysis
  const {
    wrestlerAnalyses,
    filteredAnalysis,
    isAnalyzing,
    lastAnalysisTime,
    analyzeWrestlers,
    hasRealData
  } = useWrestlerAnalysis(wrestlers, newsItems, '1', 'all');

  // Map to the expected format for the UI
  const processedWrestlers = filteredAnalysis.map(analysis => {
    console.log(`📋 Processing wrestler for UI: ${analysis.wrestler_name}`, {
      mentions: analysis.totalMentions,
      pushScore: analysis.pushScore,
      burialScore: analysis.burialScore,
      relatedNewsCount: analysis.relatedNews?.length || 0,
      mentionSourcesCount: analysis.mention_sources?.length || 0
    });

    // Ensure we have the actual news articles, not just empty arrays
    const relatedNewsArticles = analysis.relatedNews && analysis.relatedNews.length > 0 
      ? analysis.relatedNews 
      : (analysis.mention_sources || []).map(source => ({
          title: source.title,
          link: source.url || '#',
          source: source.source_name,
          pubDate: source.timestamp ? new Date(source.timestamp).toISOString() : new Date().toISOString(),
          contentSnippet: source.content_snippet || ''
        }));

    const mentionSourcesData = analysis.mention_sources && analysis.mention_sources.length > 0
      ? analysis.mention_sources
      : (analysis.relatedNews || []).map(news => ({
          id: `mention-${analysis.id}-${Date.now()}`,
          wrestler_name: analysis.wrestler_name,
          source_type: 'news' as const,
          source_name: news.source || 'Wrestling News',
          title: news.title,
          url: news.link || '#',
          content_snippet: news.contentSnippet || '',
          timestamp: new Date(news.pubDate || Date.now()),
          sentiment_score: 0.7
        }));

    console.log(`📰 News data for ${analysis.wrestler_name}:`, {
      relatedNewsCount: relatedNewsArticles.length,
      mentionSourcesCount: mentionSourcesData.length,
      hasNews: relatedNewsArticles.length > 0,
      sampleNews: relatedNewsArticles.slice(0, 2).map(n => n.title)
    });

    return {
      ...analysis,
      id: analysis.id,
      wrestler_name: analysis.wrestler_name,
      name: analysis.wrestler_name,
      promotion: analysis.promotion,
      pushScore: analysis.pushScore || 0,
      burialScore: analysis.burialScore || 0,
      momentumScore: analysis.momentumScore || 0,
      popularityScore: analysis.popularityScore || 0,
      totalMentions: analysis.totalMentions || 0,
      mention_count: analysis.totalMentions || 0,
      sentimentScore: analysis.sentimentScore || 50,
      isChampion: analysis.isChampion || false,
      championshipTitle: analysis.championshipTitle,
      isOnFire: analysis.isOnFire || false,
      confidence_level: analysis.totalMentions >= 5 ? 'high' : analysis.totalMentions >= 3 ? 'medium' : 'low',
      data_sources: {
        total_mentions: analysis.totalMentions || 0,
        tier_1_mentions: 0,
        tier_2_mentions: analysis.totalMentions || 0,
        tier_3_mentions: 0,
        hours_since_last_mention: 24,
        source_breakdown: analysis.source_breakdown || {}
      },
      last_updated: new Date().toISOString(),
      // Ensure news data is properly included with actual articles
      relatedNews: relatedNewsArticles,
      mention_sources: mentionSourcesData,
      // Add debug info
      _debug: {
        hasRelatedNews: relatedNewsArticles.length > 0,
        hasMentionSources: mentionSourcesData.length > 0,
        totalNewsItems: relatedNewsArticles.length + mentionSourcesData.length,
        originalAnalysisNews: analysis.relatedNews?.length || 0,
        originalAnalysisSources: analysis.mention_sources?.length || 0
      }
    };
  });

  console.log(`📊 Processed ${processedWrestlers.length} wrestlers for UI display`);

  // Track when we first get data
  useEffect(() => {
    if (processedWrestlers.length > 0) {
      console.log('✅ Initial data loaded, setting hasInitialData to true');
      setHasInitialData(true);
    }
  }, [processedWrestlers.length]);

  // Force refresh function
  const forceRefresh = async () => {
    console.log('🔄 Force refresh triggered');
    setIsProcessing(true);
    
    try {
      await analyzeWrestlers();
      setLastProcessTime(new Date());
      console.log('✅ Force refresh completed');
    } catch (error) {
      console.error('❌ Error during force refresh:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Update processing state
  useEffect(() => {
    const shouldShowProcessing = isAnalyzing && !hasInitialData && processedWrestlers.length === 0;
    
    console.log('🔄 Processing state update:', {
      isAnalyzing,
      hasInitialData,
      processedWrestlersCount: processedWrestlers.length,
      shouldShowProcessing
    });

    setIsProcessing(shouldShowProcessing);
    
    if (lastAnalysisTime) {
      setLastProcessTime(lastAnalysisTime);
    }
  }, [isAnalyzing, lastAnalysisTime, hasInitialData, processedWrestlers.length]);

  const finalHasRealData = hasRealData || hasInitialData || processedWrestlers.length > 0;

  console.log('📈 Final hook state:', {
    processedWrestlersCount: processedWrestlers.length,
    isProcessing: isProcessing && processedWrestlers.length === 0,
    finalHasRealData,
    lastProcessTime: lastProcessTime?.toISOString()
  });

  return {
    processedWrestlers,
    isProcessing: isProcessing && processedWrestlers.length === 0,
    hasRealData: finalHasRealData,
    lastProcessTime,
    forceRefresh
  };
};
