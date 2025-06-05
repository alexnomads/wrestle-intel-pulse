
import { NewsItem } from './dataTypes';

const COMPREHENSIVE_RSS_FEEDS = [
  // Major Wrestling News Sites
  { url: 'https://www.f4wonline.com/feed', source: 'F4W Online' },
  { url: 'https://www.pwtorch.com/site/feed', source: 'PWTorch' },
  { url: 'https://www.pwinsider.com/rss.php', source: 'PWInsider' },
  { url: 'https://www.wrestlinginc.com/feed/', source: 'Wrestling Inc' },
  { url: 'https://www.fightful.com/feed', source: 'Fightful' },
  { url: 'https://www.wrestlingheadlines.com/feed/', source: 'Wrestling Headlines' },
  { url: 'https://www.ringsidenews.com/feed/', source: 'Ringside News' },
  { url: 'https://www.sescoops.com/feed/', source: 'Sescoops' },
  { url: 'https://www.wrestlezone.com/feed/', source: 'WrestleZone' },
  { url: 'https://www.cagesideseats.com/rss/current', source: 'Cageside Seats' },
  
  // Official Promotion Feeds
  { url: 'https://www.wwe.com/feeds/all', source: 'WWE.com' },
  { url: 'https://www.allelitewrestling.com/rss', source: 'AEW.com' },
  { url: 'https://www.impactwrestling.com/feed/', source: 'Impact Wrestling' },
  
  // Additional Wrestling Sources
  { url: 'https://411mania.com/wrestling/feed/', source: '411 Mania' },
  { url: 'https://www.pwmania.com/feed', source: 'PWMania' },
  { url: 'https://www.wrestletalk.com/feed', source: 'WrestleTalk' },
  { url: 'https://www.postwrestling.com/feed', source: 'POST Wrestling' },
  { url: 'https://www.voicesofwrestling.com/feed', source: 'Voices of Wrestling' }
];

// Twitter/X Wrestling Accounts (we'll convert these to RSS-like feeds)
const WRESTLING_TWITTER_ACCOUNTS = [
  'SeanRossSapp', 'WrestleVotes', 'ryansatin', 'MikeJohnson', 'davemeltzerWON',
  'SoDuTw', 'TheWrestlingRev', 'ConradThompson', 'tonykhantron', 'HeyHeyItsConrad',
  'JRsBBQ', 'MichaelCole', 'WadeBarrett', 'bryanalvarez', 'GRossiGCW',
  'WrestlingSheet', 'wrestlingnewsco', 'ringsidenews_', 'WWE', 'AEW',
  'njpw1972', 'IMPACTWRESTLING', 'ringofhonor', 'GameChangerWres',
  'wrestling_memes', 'SimpsonsWWE', 'WrestlingCovers', 'WrestleCrap',
  'HeelByNature', 'FakeWWENews', 'WWECreative_ish', 'WrestlingGifs',
  'WWEMemes', 'WrestleMania', 'TableSpot', 'ProWResBlog', 'WrasslorMonkey',
  'DeathToAllMarks', 'WrestlingFigs', 'WrestlingTravel', 'IndyWrestling',
  'SquaredCircleSi', 'WrestlingRewind', 'VintageWCW', 'OnThisDateWWE',
  'WrestlingBios', 'ClassicWrestlin', 'ECWPress'
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

// Fetch Twitter/X content using alternative methods since direct API access requires keys
const fetchTwitterContent = async (username: string): Promise<NewsItem[]> => {
  try {
    // Using RSS Bridge or similar service for Twitter content
    const rssUrl = `https://rsshub.app/twitter/user/${username}`;
    const corsProxy = `https://api.allorigins.win/get?url=${encodeURIComponent(rssUrl)}`;
    
    const response = await fetch(corsProxy);
    const data = await response.json();
    
    if (!data.contents) {
      return [];
    }
    
    const parsedItems = parseRSSFeed(data.contents);
    
    return parsedItems.slice(0, 3).map(item => ({
      title: item.title || '',
      link: item.link || '',
      pubDate: item.pubDate || '',
      contentSnippet: item.contentSnippet || '',
      source: `@${username}`,
      guid: item.guid || item.link || '',
      author: username,
      category: 'Twitter'
    }));
  } catch (error) {
    console.error(`Error fetching Twitter content for @${username}:`, error);
    return [];
  }
};

export const fetchComprehensiveWrestlingNews = async (): Promise<NewsItem[]> => {
  const allNews: NewsItem[] = [];
  
  console.log('Starting comprehensive wrestling news fetch...');
  
  // Fetch RSS feeds
  for (const feed of COMPREHENSIVE_RSS_FEEDS) {
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
      
      const newsItems: NewsItem[] = parsedItems.slice(0, 8).map(item => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || '',
        contentSnippet: item.contentSnippet || '',
        source: feed.source,
        guid: item.guid || item.link || '',
        author: item.author || '',
        category: item.category || 'Wrestling News'
      }));
      
      allNews.push(...newsItems);
      console.log(`Fetched ${newsItems.length} items from ${feed.source}`);
    } catch (error) {
      console.error(`Error fetching RSS feed from ${feed.source}:`, error);
    }
  }
  
  // Fetch Twitter content (limited due to API restrictions)
  const priorityTwitterAccounts = ['WWE', 'AEW', 'SeanRossSapp', 'WrestleVotes', 'davemeltzerWON'];
  
  for (const account of priorityTwitterAccounts) {
    try {
      const twitterNews = await fetchTwitterContent(account);
      allNews.push(...twitterNews);
      console.log(`Fetched ${twitterNews.length} items from @${account}`);
    } catch (error) {
      console.error(`Error fetching Twitter content for @${account}:`, error);
    }
  }
  
  // Sort by publication date (newest first) and remove duplicates
  const uniqueNews = allNews.filter((item, index, self) => 
    index === self.findIndex(t => t.title === item.title)
  );
  
  console.log(`Total comprehensive news items fetched: ${uniqueNews.length}`);
  
  return uniqueNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
};

// Enhanced Reddit service to include all wrestling subreddits
export const fetchComprehensiveRedditPosts = async () => {
  const COMPREHENSIVE_WRESTLING_SUBREDDITS = [
    'SquaredCircle', 'WWE', 'AEWOfficial', 'Wreddit', 'SCJerk',
    'njpw', 'ROH', 'ImpactWrestling', 'IndieWrestling', 'FantasyBooking',
    'WrestlingGM', 'prowrestling', 'nxt', 'Puroresu', 'WrestlingGenius',
    'WrestlingEmpire', 'TonyKhan', 'ufc', 'MMA'
  ];

  const allPosts: any[] = [];
  
  for (const subreddit of COMPREHENSIVE_WRESTLING_SUBREDDITS) {
    try {
      console.log(`Fetching Reddit posts from r/${subreddit}...`);
      const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=15`);
      
      if (!response.ok) {
        console.error(`Reddit API error for r/${subreddit}: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      if (!data.data || !data.data.children) {
        console.error(`No data received from r/${subreddit}`);
        continue;
      }
      
      const posts = data.data.children.map((child: any) => ({
        title: child.data.title,
        url: child.data.url,
        created_utc: child.data.created_utc,
        score: child.data.score,
        num_comments: child.data.num_comments,
        author: child.data.author,
        subreddit: child.data.subreddit,
        selftext: child.data.selftext || '',
        permalink: child.data.permalink
      }));
      
      allPosts.push(...posts);
      console.log(`Fetched ${posts.length} posts from r/${subreddit}`);
    } catch (error) {
      console.error(`Error fetching Reddit posts from r/${subreddit}:`, error);
    }
  }
  
  // Sort by score (popularity) and return top posts
  return allPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);
};
