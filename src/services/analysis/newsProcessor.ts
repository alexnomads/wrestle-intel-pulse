
import { analyzeSentiment } from '@/services/wrestlingDataService';
import type { NewsItem } from '@/types/wrestlerAnalysis';

export interface ProcessedNewsContent {
  content: string;
  item: NewsItem;
  sentiment: { score: number };
}

export const preprocessNewsContent = (newsItems: NewsItem[]): ProcessedNewsContent[] => {
  const allContent: ProcessedNewsContent[] = newsItems.map(item => ({
    content: `${item.title} ${item.contentSnippet || ''}`.toLowerCase(),
    item: item,
    sentiment: analyzeSentiment(`${item.title} ${item.contentSnippet || ''}`)
  }));
  
  console.log('News items to analyze:');
  allContent.forEach((content, index) => {
    console.log(`${index + 1}. "${content.item.title}"`);
  });
  
  return allContent;
};
