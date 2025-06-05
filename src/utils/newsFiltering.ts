
import type { NewsItem } from '@/types/wrestlerAnalysis';

export const filterNewsByTimePeriod = (
  newsItems: NewsItem[], 
  selectedTimePeriod: string
): NewsItem[] => {
  const periodDays = parseInt(selectedTimePeriod);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - periodDays);
  
  const filtered = newsItems.filter(item => {
    const itemDate = new Date(item.pubDate);
    return itemDate >= cutoffDate;
  });
  
  console.log('Filtered news items:', {
    total: newsItems.length,
    filtered: filtered.length,
    cutoffDate: cutoffDate.toISOString()
  });
  
  return filtered;
};
