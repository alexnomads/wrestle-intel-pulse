import { useState, useEffect, useMemo } from 'react';
import { NewsItem } from '@/services/data/dataTypes';
import { WrestlerAnalysis } from '@/types/wrestlerAnalysis';
import { analyzeWrestlerMentions, getStoredWrestlerMetrics } from '@/services/wrestler-analysis';

export const useWrestlerAnalysis = (
  wrestlers: any[],
  newsItems: NewsItem[],
  minMentions: string = '1',
  promotion: string = 'all'
) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [wrestlerAnalyses, setWrestlerAnalyses] = useState<WrestlerAnalysis[]>([]);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<Date | null>(null);

  // Function to trigger new analysis
  const analyzeWrestlers = async () => {
    if (wrestlers.length === 0 || newsItems.length === 0) {
      console.log('No wrestlers or news items available for analysis');
      return;
    }

    console.log('Starting wrestler analysis...', {
      wrestlers: wrestlers.length,
      newsItems: newsItems.length
    });

    setIsAnalyzing(true);
    
    try {
      // Filter wrestlers by promotion if specified
      const filteredWrestlers = promotion === 'all' 
        ? wrestlers 
        : wrestlers.filter(w => w.promotions?.name?.toLowerCase() === promotion.toLowerCase());

      console.log(`Analyzing ${filteredWrestlers.length} wrestlers for promotion: ${promotion}`);

      // Run the enhanced analysis
      const analyses = await analyzeWrestlerMentions(filteredWrestlers, newsItems);
      
      setWrestlerAnalyses(analyses);
      setLastAnalysisTime(new Date());
      
      console.log(`Analysis completed. Found ${analyses.length} wrestlers with mentions.`);
    } catch (error) {
      console.error('Error analyzing wrestlers:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load stored data on mount
  useEffect(() => {
    const loadStoredData = async () => {
      console.log('Loading stored wrestler metrics...');
      const storedAnalyses = await getStoredWrestlerMetrics();
      
      if (storedAnalyses.length > 0) {
        setWrestlerAnalyses(storedAnalyses);
        setLastAnalysisTime(new Date());
        console.log(`Loaded ${storedAnalyses.length} stored analyses`);
      } else if (wrestlers.length > 0 && newsItems.length > 0) {
        // If no stored data, run fresh analysis
        console.log('No stored data found, running fresh analysis...');
        analyzeWrestlers();
      }
    };

    loadStoredData();
  }, [wrestlers.length, newsItems.length]);

  // Auto-refresh every 15 minutes if we have fresh news
  useEffect(() => {
    if (!lastAnalysisTime || wrestlers.length === 0 || newsItems.length === 0) return;

    const interval = setInterval(() => {
      const timeSinceLastAnalysis = Date.now() - lastAnalysisTime.getTime();
      const fifteenMinutes = 15 * 60 * 1000;

      if (timeSinceLastAnalysis > fifteenMinutes) {
        console.log('Auto-refreshing wrestler analysis...');
        analyzeWrestlers();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [lastAnalysisTime, wrestlers.length, newsItems.length]);

  // Filter analyses based on criteria
  const filteredAnalysis = useMemo(() => {
    const minMentionsNum = parseInt(minMentions) || 1;
    
    return wrestlerAnalyses.filter(analysis => {
      const meetsMinMentions = analysis.totalMentions >= minMentionsNum;
      const meetsPromotion = promotion === 'all' || 
        analysis.promotion.toLowerCase() === promotion.toLowerCase();
      
      return meetsMinMentions && meetsPromotion;
    });
  }, [wrestlerAnalyses, minMentions, promotion]);

  return {
    wrestlerAnalyses,
    filteredAnalysis,
    isAnalyzing,
    lastAnalysisTime,
    analyzeWrestlers,
    hasRealData: wrestlerAnalyses.length > 0 && wrestlerAnalyses.some(w => w.totalMentions > 0)
  };
};
