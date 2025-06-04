export interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet: string;
  source: string;
  guid: string;
  author?: string;
  category?: string;
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
  permalink: string;
}

export interface WrestlenomicsData {
  tvRatings: TVRating[];
  ticketSales: TicketData[];
  eloRankings: ELORanking[];
}

export interface TVRating {
  show: string;
  date: string;
  rating: number;
  viewership: number;
  network: string;
}

export interface TicketData {
  event: string;
  venue: string;
  date: string;
  capacity: number;
  sold: number;
  attendance_percentage: number;
}

export interface ELORanking {
  wrestler: string;
  elo_rating: number;
  promotion: string;
  rank: number;
  trend: 'up' | 'down' | 'stable';
}

const RSS_FEEDS = [
  { url: 'https://www.wrestlinginc.com/feed/', source: 'Wrestling Inc' },
  { url: 'https://411mania.com/wrestling/feed/', source: '411 Mania' },
  { url: 'https://www.fightful.com/wrestling/feed', source: 'Fightful' },
  { url: 'https://www.f4wonline.com/feed', source: 'F4W Online' },
  { url: 'https://www.sescoops.com/feed/', source: 'Sescoops' },
  { url: 'https://www.pwmania.com/feed', source: 'PWMania' }
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
      
      const newsItems: NewsItem[] = parsedItems.slice(0, 10).map(item => ({
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
  
  // Sort by publication date (newest first)
  return allNews.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
};

export const fetchRedditPosts = async (): Promise<RedditPost[]> => {
  try {
    console.log('Fetching Reddit posts from r/SquaredCircle...');
    const response = await fetch('https://www.reddit.com/r/SquaredCircle/hot.json?limit=25');
    
    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const posts: RedditPost[] = data.data.children.map((child: any) => ({
      title: child.data.title,
      url: child.data.url,
      created_utc: child.data.created_utc,
      score: child.data.score,
      num_comments: child.data.num_comments,
      author: child.data.author,
      subreddit: child.data.subreddit,
      selftext: child.data.selftext,
      permalink: child.data.permalink
    }));
    
    console.log(`Fetched ${posts.length} Reddit posts`);
    return posts;
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
    return [];
  }
};

// Wrestlenomics data scraping functions
export const scrapeWrestlenomicsData = async (): Promise<Partial<WrestlenomicsData>> => {
  const data: Partial<WrestlenomicsData> = {};
  
  try {
    console.log('Fetching real Wrestlenomics data...');
    
    // Import the Wrestlenomics service functions
    const { getStoredTVRatings, getStoredTicketSales, getStoredELORankings } = await import('./wrestlenomicsService');
    
    // Fetch stored data from Supabase
    const [tvRatings, ticketSales, eloRankings] = await Promise.all([
      getStoredTVRatings(),
      getStoredTicketSales(),
      getStoredELORankings()
    ]);

    // Transform the data to match our interfaces
    data.tvRatings = tvRatings.map((rating: any) => ({
      show: rating.show,
      date: rating.air_date,
      rating: rating.rating,
      viewership: rating.viewership,
      network: rating.network
    }));

    data.ticketSales = ticketSales.map((ticket: any) => ({
      event: ticket.event_name,
      venue: ticket.venue,
      date: ticket.event_date,
      capacity: ticket.capacity,
      sold: ticket.tickets_sold,
      attendance_percentage: ticket.attendance_percentage
    }));

    data.eloRankings = eloRankings.map((elo: any) => ({
      wrestler: elo.wrestler_name,
      elo_rating: elo.elo_rating,
      promotion: elo.promotion,
      rank: elo.ranking_position,
      trend: elo.trend as 'up' | 'down' | 'stable'
    }));
    
    console.log('Successfully fetched Wrestlenomics data:', {
      tvRatings: data.tvRatings?.length || 0,
      ticketSales: data.ticketSales?.length || 0,
      eloRankings: data.eloRankings?.length || 0
    });
  } catch (error) {
    console.error('Error fetching Wrestlenomics data:', error);
    
    // Fallback to empty arrays instead of mock data
    data.tvRatings = [];
    data.ticketSales = [];
    data.eloRankings = [];
  }
  
  return data;
};

// Enhanced sentiment analysis using real keyword detection
export const analyzeSentiment = (text: string): { score: number; keywords: string[] } => {
  const positiveKeywords = [
    'amazing', 'incredible', 'fantastic', 'brilliant', 'outstanding', 'excellent',
    'awesome', 'great', 'love', 'perfect', 'phenomenal', 'legendary', 'classic',
    'champion', 'victory', 'win', 'success', 'return', 'debut', 'breakthrough'
  ];
  
  const negativeKeywords = [
    'terrible', 'awful', 'horrible', 'disappointing', 'boring', 'bad',
    'hate', 'worst', 'disaster', 'failure', 'flop', 'painful', 'cringe',
    'injury', 'injured', 'lose', 'defeat', 'suspended', 'controversy', 'burial'
  ];
  
  const content = text.toLowerCase();
  const foundPositive = positiveKeywords.filter(word => content.includes(word));
  const foundNegative = negativeKeywords.filter(word => content.includes(word));
  
  const positiveScore = foundPositive.length;
  const negativeScore = foundNegative.length;
  
  let score = 0.5; // neutral
  if (positiveScore > negativeScore) {
    score = Math.min(0.5 + (positiveScore * 0.1), 1.0);
  } else if (negativeScore > positiveScore) {
    score = Math.max(0.5 - (negativeScore * 0.1), 0.0);
  }
  
  return {
    score,
    keywords: [...foundPositive, ...foundNegative]
  };
};

// Extract wrestler mentions from text
export const extractWrestlerMentions = (text: string): string[] => {
  // Common wrestling names that might appear in content
  const wrestlerNames = [
    'CM Punk', 'Roman Reigns', 'Cody Rhodes', 'Seth Rollins', 'Drew McIntyre',
    'Jon Moxley', 'Kenny Omega', 'Will Ospreay', 'Rhea Ripley', 'Bianca Belair',
    'Becky Lynch', 'Sasha Banks', 'Mercedes Moné', 'Jade Cargill', 'Toni Storm',
    'Gunther', 'Damian Priest', 'LA Knight', 'Jey Uso', 'Jimmy Uso'
  ];
  
  const content = text.toLowerCase();
  return wrestlerNames.filter(name => 
    content.includes(name.toLowerCase())
  );
};
