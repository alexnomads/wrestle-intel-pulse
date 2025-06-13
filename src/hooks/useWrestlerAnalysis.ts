
import { useMemo } from 'react';
import type { Wrestler, NewsItem, WrestlerAnalysis } from '@/types/wrestlerAnalysis';
import { filterWrestlersByPromotion, filterPopularWrestlers } from '@/utils/wrestlerFiltering';
import { filterNewsByTimePeriod } from '@/utils/newsFiltering';
import { performWrestlerAnalysis } from '@/services/wrestlerAnalysisService';
import { getTopPushWrestlers, getWorstBuriedWrestlers } from '@/utils/wrestlerRanking';

export type { WrestlerAnalysis } from '@/types/wrestlerAnalysis';

export const useWrestlerAnalysis = (
  wrestlers: Wrestler[], 
  newsItems: NewsItem[], 
  selectedTimePeriod: string,
  selectedPromotion: string
) => {
  console.log('useWrestlerAnalysis - Input data:', {
    wrestlersCount: wrestlers.length,
    newsItemsCount: newsItems.length,
    selectedTimePeriod,
    selectedPromotion
  });

  const filteredWrestlers = useMemo(() => {
    return filterWrestlersByPromotion(wrestlers, selectedPromotion);
  }, [wrestlers, selectedPromotion]);

  const periodNewsItems = useMemo(() => {
    let newsForPeriod = filterNewsByTimePeriod(newsItems, selectedTimePeriod);
    
    // If we don't have enough news for the selected period, expand to at least 7 days
    if (newsForPeriod.length < 50) {
      console.log('Not enough news for selected period, expanding to 7 days minimum');
      const sevenDayNews = filterNewsByTimePeriod(newsItems, '7');
      if (sevenDayNews.length > newsForPeriod.length) {
        newsForPeriod = sevenDayNews;
      }
    }
    
    return newsForPeriod;
  }, [newsItems, selectedTimePeriod]);

  const pushBurialAnalysis = useMemo(() => {
    const popularWrestlers = filterPopularWrestlers(wrestlers);
    console.log('Analyzing', popularWrestlers.length, 'filtered wrestlers');
    
    // Pass minimum wrestler requirement to ensure at least 10, include news items for mention sources
    return performWrestlerAnalysis(popularWrestlers, periodNewsItems, 10);
  }, [wrestlers, periodNewsItems]);

  const filteredAnalysis = useMemo(() => {
    return selectedPromotion === 'all'
      ? pushBurialAnalysis
      : pushBurialAnalysis.filter(wrestler => 
          wrestler.promotion.toLowerCase().includes(selectedPromotion.toLowerCase())
        );
  }, [pushBurialAnalysis, selectedPromotion]);

  const topPushWrestlers = useMemo(() => {
    return getTopPushWrestlers(filteredAnalysis);
  }, [filteredAnalysis]);

  const worstBuriedWrestlers = useMemo(() => {
    return getWorstBuriedWrestlers(filteredAnalysis);
  }, [filteredAnalysis]);

  return {
    filteredWrestlers,
    periodNewsItems,
    pushBurialAnalysis,
    filteredAnalysis,
    topPushWrestlers,
    worstBuriedWrestlers
  };
};
