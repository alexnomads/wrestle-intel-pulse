
import { NewsItem } from './dataTypes';
import { smartCache, fetchDataWithFallback } from '../optimizedDataService';

// Prioritized feeds - fastest and most reliable first
const PRIORITY_FEEDS = [
  { url: 'https://www.f4wonline.com/feed', source: 'F4W Online', priority: 1 },
  { url: 'https://www.fightful.com/wrestling/feed', source: 'Fightful', priority: 1 },
  { url: 'https://www.pwtorch.com/site/feed', source: 'PWTorch', priority: 1 },
  { url: 'https://www.pwinsider.com/rss.php', source: 'PWInsider', priority: 2 },
  { url: 'https://www.wrestlinginc.com/feed/', source: 'Wrestling Inc', priority: 2 },
  { url: 'https://411mania.com/wrestling/feed/', source: '411 Mania', priority: 3 },
  { url: 'https://www.sescoops.com/feed/', source: 'Sescoops', priority: 3 }
];

const parseRSSFeed = (xmlString: string): any[] => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
  
  const items = xmlDoc.querySelectorAll('item');
  const parsedItems: any[] = [];
  
  items.forEach(item => {
    const title = item.querySelector('title')?.textContent || '';
    const link = item.querySelector('link')?.textContent || '';
    const pubDate = item.querySelector('pubDate')?.textContent || '';
    const description = item.querySelector('description')?.textContent || '';
    const guid = item.querySelector('guid')?.textContent || link;
    
    parsedItems.push({
      title: title.trim(),
      link: link.trim(),
      pubDate: pubDate.trim(),
      contentSnippet: description.replace(/<[^>]*>/g, '').trim(),
      guid: guid.trim()
    });
  });
  
  return parsedItems;
};

const fetchSingleFeedOptimized = async (feed: any): Promise<NewsItem[]> => {
  const cacheKey = `rss-${feed.source}`;
  const cached = smartCache.get<NewsItem[]>(cacheKey);
  
  // Return cached data if less than 5 minutes old
  if (cached && !smartCache.isStale(cacheKey, 5)) {
    return cached;
  }
  
  try {
    const controller = new AbortController();
    const timeoutMs = feed.priority === 1 ? 3000 : 2000; // Faster timeouts
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
    
    const response = await fetch(proxyUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.contents) {
      throw new Error('No content received');
    }
    
    const parsedItems = parseRSSFeed(data.contents);
    
    const newsItems: NewsItem[] = parsedItems.slice(0, 8).map(item => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || new Date().toISOString(),
      contentSnippet: item.contentSnippet || '',
      source: feed.source,
      guid: item.guid || item.link || '',
      author: '',
      category: ''
    }));

    // Cache the result
    smartCache.set(cacheKey, newsItems, 10); // 10 minute cache
    
    return newsItems;
    
  } catch (error) {
    // Return cached data if available, even if stale
    if (cached) {
      console.log(`Using stale cache for ${feed.source} due to error:`, error);
      return cached;
    }
    
    console.warn(`Failed to fetch from ${feed.source}:`, error);
    return [];
  }
};

export const fetchOptimizedRSSFeedsParallel = async (): Promise<NewsItem[]> => {
  console.log('🚀 Starting optimized parallel RSS feed collection...');
  
  // Fetch all feeds in parallel with individual error handling
  const feedPromises = PRIORITY_FEEDS.map(feed => 
    fetchDataWithFallback(() => fetchSingleFeedOptimized(feed), feed.source, 4000)
  );
  
  const results = await Promise.allSettled(feedPromises);
  const allNews: NewsItem[] = [];
  
  // Collect successful results
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.success) {
      allNews.push(...result.value.data);
    } else {
      console.warn(`Feed ${PRIORITY_FEEDS[index].source} failed or timed out`);
    }
  });
  
  // Remove duplicates and sort by date
  const uniqueNews = allNews.filter((item, index, self) => 
    index === self.findIndex(t => t.title === item.title || t.guid === item.guid)
  );
  
  const sortedNews = uniqueNews.sort((a, b) => 
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
  
  console.log(`✅ Optimized RSS collection complete: ${sortedNews.length} articles from ${results.length} sources`);
  
  return sortedNews;
};
