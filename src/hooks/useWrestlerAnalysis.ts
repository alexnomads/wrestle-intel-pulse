
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

    console.log('Starting fresh wrestler analysis...', {
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
      
      console.log(`Fresh analysis completed. Found ${analyses.length} wrestlers with mentions.`);
    } catch (error) {
      console.error('Error analyzing wrestlers:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load stored data on mount and whenever dependencies change
  useEffect(() => {
    const loadStoredData = async () => {
      console.log('Loading stored wrestler metrics...');
      
      try {
        const storedAnalyses = await getStoredWrestlerMetrics();
        
        if (storedAnalyses.length > 0) {
          console.log(`✅ Loaded ${storedAnalyses.length} stored analyses`);
          setWrestlerAnalyses(storedAnalyses);
          setLastAnalysisTime(new Date());
        } else {
          console.log('⚠️ No stored analyses found, will run fresh analysis when news is available');
          if (wrestlers.length > 0 && newsItems.length > 0) {
            console.log('📰 News available, running fresh analysis...');
            analyzeWrestlers();
          }
        }
      } catch (error) {
        console.error('❌ Error loading stored data:', error);
        // Fallback to fresh analysis if stored data fails
        if (wrestlers.length > 0 && newsItems.length > 0) {
          analyzeWrestlers();
        }
      }
    };

    loadStoredData();
  }, [wrestlers.length, newsItems.length, promotion]);

  // Filter analyses based on criteria
  const filteredAnalysis = useMemo(() => {
    const minMentionsNum = parseInt(minMentions) || 1;
    
    console.log(`🔍 Filtering ${wrestlerAnalyses.length} analyses with min mentions: ${minMentionsNum}, promotion: ${promotion}`);
    
    const filtered = wrestlerAnalyses.filter(analysis => {
      // Handle both stored data format (mention_count) and fresh analysis format (totalMentions)
      const actualMentions = analysis.totalMentions || 0;
      const meetsMinMentions = actualMentions >= minMentionsNum;
      const meetsPromotion = promotion === 'all' || 
        analysis.promotion.toLowerCase() === promotion.toLowerCase();
      
      const passes = meetsMinMentions && meetsPromotion;
      
      if (passes) {
        console.log(`✅ Wrestler passed filter: ${analysis.wrestler_name} (${actualMentions} mentions, ${analysis.promotion})`);
      }
      
      return passes;
    });
    
    console.log(`📊 Filtered result: ${filtered.length} wrestlers pass criteria`);
    return filtered;
  }, [wrestlerAnalyses, minMentions, promotion]);

  // Calculate if we have real data
  const hasRealData = useMemo(() => {
    const hasData = wrestlerAnalyses.length > 0 && wrestlerAnalyses.some(w => (w.totalMentions || 0) > 0);
    console.log(`📈 hasRealData calculation: ${hasData} (${wrestlerAnalyses.length} total, with mentions: ${wrestlerAnalyses.filter(w => (w.totalMentions || 0) > 0).length})`);
    return hasData;
  }, [wrestlerAnalyses]);

  return {
    wrestlerAnalyses,
    filteredAnalysis,
    isAnalyzing,
    lastAnalysisTime,
    analyzeWrestlers,
    hasRealData
  };
};
