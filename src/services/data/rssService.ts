
import { NewsItem } from './dataTypes';

const RSS_FEEDS = [
  { url: 'https://www.wrestlinginc.com/feed/', source: 'Wrestling Inc' },
  { url: 'https://411mania.com/wrestling/feed/', source: '411 Mania' },
  { url: 'https://www.fightful.com/wrestling/feed', source: 'Fightful' },
  { url: 'https://www.f4wonline.com/feed', source: 'F4W Online' },
  { url: 'https://www.sescoops.com/feed/', source: 'Sescoops' },
  { url: 'https://www.pwmania.com/feed', source: 'PWMania' },
  { url: 'https://www.pwtorch.com/site/feed', source: 'PWTorch' },
  { url: 'https://www.pwinsider.com/rss.php', source: 'PWInsider' },
  { url: 'https://www.wrestlingheadlines.com/feed/', source: 'Wrestling Headlines' },
  { url: 'https://www.ringsidenews.com/feed/', source: 'Ringside News' },
  { url: 'https://www.wrestlezone.com/feed/', source: 'WrestleZone' },
  { url: 'https://www.cagesideseats.com/rss/current', source: 'Cageside Seats' }
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
    const author = item.querySelector('author')?.textContent || item.querySelector('dc\\:creator')?.textContent || '';
    const category = item.querySelector('category')?.textContent || '';
    
    parsedItems.push({
      title: title.trim(),
      link: link.trim(),
      pubDate: pubDate.trim(),
      contentSnippet: description.replace(/<[^>]*>/g, '').trim(),
      guid: guid.trim(),
      author: author.trim(),
      category: category.trim()
    });
  });
  
  return parsedItems;
};

export const fetchRSSFeeds = async (): Promise<NewsItem[]> => {
  const allNews: NewsItem[] = [];
  const maxRetries = 1; // Reduce retries for faster response
  const timeout = 5000; // 5 second timeout per feed
  
  // Process feeds concurrently with a limit to avoid overwhelming servers
  const processFeed = async (feed: any): Promise<NewsItem[]> => {
    try {
      console.log(`Fetching RSS feed from ${feed.source}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Use a more reliable proxy
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
      
      const newsItems: NewsItem[] = parsedItems.slice(0, 10).map(item => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || new Date().toISOString(),
        contentSnippet: item.contentSnippet || '',
        source: feed.source,
        guid: item.guid || item.link || '',
        author: item.author || '',
        category: item.category || ''
      }));
      
      console.log(`Successfully fetched ${newsItems.length} items from ${feed.source}`);
      return newsItems;
      
    } catch (error) {
      console.warn(`Failed to fetch from ${feed.source}:`, error);
      return [];
    }
  };
  
  // Process feeds in smaller batches to avoid timeouts
  const batchSize = 4;
  for (let i = 0; i < RSS_FEEDS.length; i += batchSize) {
    const batch = RSS_FEEDS.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(feed => processFeed(feed))
    );
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allNews.push(...result.value);
      }
    });
    
    // Small delay between batches
    if (i + batchSize < RSS_FEEDS.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Sort by publication date (newest first) and remove duplicates
  const uniqueNews = allNews.filter((item, index, self) => 
    index === self.findIndex(t => t.title === item.title || t.guid === item.guid)
  );
  
  console.log(`Total RSS news items fetched: ${uniqueNews.length} from ${RSS_FEEDS.length} sources`);
  
  return uniqueNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
};
