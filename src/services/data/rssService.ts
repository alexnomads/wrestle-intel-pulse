
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
  { url: 'https://www.cagesideseats.com/rss/current', source: 'Cageside Seats' },
  { url: 'https://www.wwe.com/feeds/all', source: 'WWE.com' },
  { url: 'https://www.allelitewrestling.com/rss', source: 'AEW.com' },
  { url: 'https://www.impactwrestling.com/feed/', source: 'Impact Wrestling' },
  { url: 'https://www.wrestletalk.com/feed', source: 'WrestleTalk' },
  { url: 'https://www.postwrestling.com/feed', source: 'POST Wrestling' },
  { url: 'https://www.voicesofwrestling.com/feed', source: 'Voices of Wrestling' }
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
  const maxRetries = 2;
  
  for (const feed of RSS_FEEDS) {
    let retryCount = 0;
    let success = false;
    
    while (retryCount < maxRetries && !success) {
      try {
        console.log(`Fetching RSS feed from ${feed.source} (attempt ${retryCount + 1})...`);
        
        // Try multiple CORS proxies for better reliability
        const corsProxies = [
          `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`,
          `https://cors-anywhere.herokuapp.com/${feed.url}`,
          `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feed.url)}`
        ];
        
        let response;
        let data;
        
        for (const proxy of corsProxies) {
          try {
            response = await fetch(proxy, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml',
              }
            });
            
            if (response.ok) {
              data = await response.json();
              if (data.contents || data.content) {
                break;
              }
            }
          } catch (proxyError) {
            console.warn(`Proxy ${proxy} failed for ${feed.source}:`, proxyError);
            continue;
          }
        }
        
        if (!data || (!data.contents && !data.content)) {
          throw new Error(`No content received from any proxy for ${feed.source}`);
        }
        
        const xmlContent = data.contents || data.content || data;
        const parsedItems = parseRSSFeed(xmlContent);
        
        const newsItems: NewsItem[] = parsedItems.slice(0, 8).map(item => ({
          title: item.title || '',
          link: item.link || '',
          pubDate: item.pubDate || new Date().toISOString(),
          contentSnippet: item.contentSnippet || '',
          source: feed.source,
          guid: item.guid || item.link || '',
          author: item.author || '',
          category: item.category || ''
        }));
        
        allNews.push(...newsItems);
        console.log(`Successfully fetched ${newsItems.length} items from ${feed.source}`);
        success = true;
        
      } catch (error) {
        retryCount++;
        console.error(`Error fetching RSS feed from ${feed.source} (attempt ${retryCount}):`, error);
        
        if (retryCount >= maxRetries) {
          console.error(`Failed to fetch from ${feed.source} after ${maxRetries} attempts`);
        } else {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
    }
  }
  
  // Sort by publication date (newest first) and remove duplicates
  const uniqueNews = allNews.filter((item, index, self) => 
    index === self.findIndex(t => t.title === item.title || t.guid === item.guid)
  );
  
  console.log(`Total RSS news items fetched: ${uniqueNews.length} from ${RSS_FEEDS.length} sources`);
  
  return uniqueNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
};
