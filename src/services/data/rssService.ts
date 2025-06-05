
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
  { url: 'https://www.impactwrestling.com/feed/', source: 'Impact Wrestling' }
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
  
  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Fetching RSS feed from ${feed.source}...`);
      const corsProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
      const response = await fetch(corsProxy);
      const data = await response.json();
      
      if (!data.contents) {
        console.error(`No content received from ${feed.source}`);
        continue;
      }
      
      const parsedItems = parseRSSFeed(data.contents);
      
      const newsItems: NewsItem[] = parsedItems.slice(0, 5).map(item => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || '',
        contentSnippet: item.contentSnippet || '',
        source: feed.source,
        guid: item.guid || item.link || '',
        author: item.author || '',
        category: item.category || ''
      }));
      
      allNews.push(...newsItems);
      console.log(`Fetched ${newsItems.length} items from ${feed.source}`);
    } catch (error) {
      console.error(`Error fetching RSS feed from ${feed.source}:`, error);
    }
  }
  
  // Sort by publication date (newest first) and remove duplicates
  const uniqueNews = allNews.filter((item, index, self) => 
    index === self.findIndex(t => t.title === item.title)
  );
  
  return uniqueNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
};
