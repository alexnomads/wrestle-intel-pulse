
import { useState, useEffect } from 'react';
import { NewsItem } from '@/services/data/dataTypes';
import { useWrestlerAnalysis } from './useWrestlerAnalysis';

export const useWrestlerDataProcessing = (wrestlers: any[], newsItems: NewsItem[]) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastProcessTime, setLastProcessTime] = useState<Date | null>(null);

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
    // Ensure all required fields are present with proper naming
    id: analysis.id,
    wrestler_name: analysis.wrestler_name,
    name: analysis.wrestler_name, // Fallback for components expecting 'name'
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
    confidence_level: (analysis as any).confidence_level || 'low',
    data_sources: (analysis as any).data_sources || {
      total_mentions: analysis.totalMentions || 0,
      tier_1_mentions: 0,
      tier_2_mentions: 0,
      tier_3_mentions: 0,
      hours_since_last_mention: 24,
      source_breakdown: {}
    },
    last_updated: (analysis as any).last_updated || new Date().toISOString()
  }));

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

  // Update processing state based on analysis - avoid false loading states
  useEffect(() => {
    // Only show processing if we're actually analyzing AND don't have data yet
    const shouldShowProcessing = isAnalyzing && processedWrestlers.length === 0;
    setIsProcessing(shouldShowProcessing);
    
    if (lastAnalysisTime) {
      setLastProcessTime(lastAnalysisTime);
    }
  }, [isAnalyzing, lastAnalysisTime, processedWrestlers.length]);

  return {
    processedWrestlers,
    isProcessing,
    hasRealData,
    lastProcessTime,
    forceRefresh
  };
};
