
import { NewsItem } from './dataTypes';

// High-priority feeds - check every 5 minutes
const HIGH_PRIORITY_FEEDS = [
  { url: 'https://www.f4wonline.com/feed', source: 'F4W Online' },
  { url: 'https://www.pwtorch.com/site/feed', source: 'PWTorch' },
  { url: 'https://www.fightful.com/wrestling/feed', source: 'Fightful' },
  { url: 'https://www.pwinsider.com/rss.php', source: 'PWInsider' },
  { url: 'https://www.wrestlinginc.com/feed/', source: 'Wrestling Inc' }
];

// Normal priority feeds - check every 15 minutes
const NORMAL_PRIORITY_FEEDS = [
  { url: 'https://411mania.com/wrestling/feed/', source: '411 Mania' },
  { url: 'https://www.sescoops.com/feed/', source: 'Sescoops' },
  { url: 'https://www.pwmania.com/feed', source: 'PWMania' },
  { url: 'https://www.wrestlingheadlines.com/feed/', source: 'Wrestling Headlines' },
  { url: 'https://www.ringsidenews.com/feed/', source: 'Ringside News' },
  { url: 'https://www.wrestlezone.com/feed/', source: 'WrestleZone' },
  { url: 'https://www.cagesideseats.com/rss/current', source: 'Cageside Seats' }
];

// Cache for feed data with timestamps
interface FeedCache {
  data: NewsItem[];
  lastFetch: Date;
  priority: 'high' | 'normal';
}

const feedCache = new Map<string, FeedCache>();

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

const fetchSingleFeed = async (feed: any, priority: 'high' | 'normal'): Promise<NewsItem[]> => {
  try {
    const cached = feedCache.get(feed.source);
    const now = new Date();
    
    // Check cache based on priority
    if (cached) {
      const minutesSinceLastFetch = (now.getTime() - cached.lastFetch.getTime()) / (1000 * 60);
      const shouldSkip = priority === 'high' ? minutesSinceLastFetch < 5 : minutesSinceLastFetch < 15;
      
      if (shouldSkip) {
        console.log(`Using cached data for ${feed.source} (${Math.round(minutesSinceLastFetch)}min ago)`);
        return cached.data;
      }
    }

    console.log(`Fetching ${priority} priority RSS feed from ${feed.source}...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
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
    
    const newsItems: NewsItem[] = parsedItems.slice(0, 15).map(item => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || new Date().toISOString(),
      contentSnippet: item.contentSnippet || '',
      source: feed.source,
      guid: item.guid || item.link || '',
      author: '',
      category: ''
    }));

    // Update cache
    feedCache.set(feed.source, {
      data: newsItems,
      lastFetch: now,
      priority
    });
    
    console.log(`Successfully fetched ${newsItems.length} items from ${feed.source} (${priority} priority)`);
    return newsItems;
    
  } catch (error) {
    console.warn(`Failed to fetch from ${feed.source}:`, error);
    
    // Return cached data if available
    const cached = feedCache.get(feed.source);
    return cached ? cached.data : [];
  }
};

export const fetchOptimizedRSSFeeds = async (): Promise<NewsItem[]> => {
  const allNews: NewsItem[] = [];
  
  console.log('Starting optimized RSS feed collection...');
  
  // Process high-priority feeds first
  console.log('Fetching high-priority feeds...');
  const highPriorityPromises = HIGH_PRIORITY_FEEDS.map(feed => 
    fetchSingleFeed(feed, 'high')
  );
  
  const highPriorityResults = await Promise.allSettled(highPriorityPromises);
  highPriorityResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      allNews.push(...result.value);
    }
  });
  
  // Process normal priority feeds
  console.log('Fetching normal-priority feeds...');
  const normalPriorityPromises = NORMAL_PRIORITY_FEEDS.map(feed => 
    fetchSingleFeed(feed, 'normal')
  );
  
  const normalPriorityResults = await Promise.allSettled(normalPriorityPromises);
  normalPriorityResults.forEach((result) => {
    if (result.status === 'fulfilled') {
      allNews.push(...result.value);
    }
  });
  
  // Remove duplicates and sort by date
  const uniqueNews = allNews.filter((item, index, self) => 
    index === self.findIndex(t => t.title === item.title || t.guid === item.guid)
  );
  
  console.log(`Total optimized RSS news items: ${uniqueNews.length} (${HIGH_PRIORITY_FEEDS.length} high-priority, ${NORMAL_PRIORITY_FEEDS.length} normal-priority feeds)`);
  
  return uniqueNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
};
