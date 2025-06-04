
export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  source: string;
  guid: string;
}

export interface RedditPost {
  title: string;
  url: string;
  created_utc: number;
  score: number;
  num_comments: number;
  author: string;
  subreddit: string;
  selftext: string;
}

const RSS_FEEDS = [
  { url: 'https://www.wrestlinginc.com/feed/', source: 'Wrestling Inc' },
  { url: 'https://411mania.com/wrestling/feed/', source: '411 Mania' },
  { url: 'https://www.fightful.com/wrestling/feed', source: 'Fightful' },
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

export const fetchRSSFeeds = async (): Promise<NewsItem[]> => {
  const allNews: NewsItem[] = [];
  
  for (const feed of RSS_FEEDS) {
    try {
      console.log(`Fetching RSS feed from ${feed.source}...`);
      const corsProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(feed.url)}`;
      const response = await fetch(corsProxy);
      const data = await response.json();
      
      const parsedItems = parseRSSFeed(data.contents);
      
      const newsItems: NewsItem[] = parsedItems.slice(0, 5).map(item => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || '',
        contentSnippet: item.contentSnippet || '',
        source: feed.source,
        guid: item.guid || item.link || ''
      }));
      
      allNews.push(...newsItems);
      console.log(`Fetched ${newsItems.length} items from ${feed.source}`);
    } catch (error) {
      console.error(`Error fetching RSS feed from ${feed.source}:`, error);
    }
  }
  
  // Sort by publication date (newest first)
  return allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
};

export const fetchRedditPosts = async (): Promise<RedditPost[]> => {
  try {
    console.log('Fetching Reddit posts from r/SquaredCircle...');
    const response = await fetch('https://www.reddit.com/r/SquaredCircle/hot.json?limit=10');
    const data = await response.json();
    
    const posts: RedditPost[] = data.data.children.map((child: any) => ({
      title: child.data.title,
      url: child.data.url,
      created_utc: child.data.created_utc,
      score: child.data.score,
      num_comments: child.data.num_comments,
      author: child.data.author,
      subreddit: child.data.subreddit,
      selftext: child.data.selftext
    }));
    
    console.log(`Fetched ${posts.length} Reddit posts`);
    return posts;
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return [];
  }
};
