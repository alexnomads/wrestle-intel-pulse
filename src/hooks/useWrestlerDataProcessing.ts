
import { useState, useEffect } from 'react';
import { NewsItem } from '@/services/data/dataTypes';
import { useWrestlerAnalysis } from './useWrestlerAnalysis';

export const useWrestlerDataProcessing = (wrestlers: any[], newsItems: NewsItem[]) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessTime, setLastProcessTime] = useState<Date | null>(null);
  const [hasInitialData, setHasInitialData] = useState(false);

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
  const processedWrestlers = filteredAnalysis.map(analysis => ({
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
    last_updated: new Date().toISOString()
  }));

  // Track when we first get data
  useEffect(() => {
    if (processedWrestlers.length > 0) {
      setHasInitialData(true);
    }
  }, [processedWrestlers.length]);

  // Force refresh function
  const forceRefresh = async () => {
    console.log('Force refresh triggered');
    setIsProcessing(true);
    
    try {
      await analyzeWrestlers();
      setLastProcessTime(new Date());
    } catch (error) {
      console.error('Error during force refresh:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Update processing state - be more permissive to show data
  useEffect(() => {
    // Only show processing on very initial load
    if (isAnalyzing && !hasInitialData && processedWrestlers.length === 0 && wrestlers.length > 0 && newsItems.length > 0) {
      setIsProcessing(true);
    } else {
      setIsProcessing(false);
    }
    
    if (lastAnalysisTime) {
      setLastProcessTime(lastAnalysisTime);
    }
  }, [isAnalyzing, lastAnalysisTime, hasInitialData, processedWrestlers.length, wrestlers.length, newsItems.length]);

  return {
    processedWrestlers,
    isProcessing: isProcessing && processedWrestlers.length === 0, // Only show loading if no data
    hasRealData: hasRealData || hasInitialData || processedWrestlers.length > 0,
    lastProcessTime,
    forceRefresh
  };
};
