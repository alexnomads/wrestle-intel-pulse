
import { RedditPost } from './dataTypes';

const WRESTLING_SUBREDDITS = [
  'SquaredCircle',
  'WWE',
  'AEWOfficial', 
  'Wreddit',
  'SCJerk',
  'njpw',
  'ROH',
  'ImpactWrestling',
  'IndieWrestling',
  'FantasyBooking',
  'WrestlingGM',
  'prowrestling'
  // Removed 'mma' and 'ufc' subreddits as requested
];

export const fetchRedditPosts = async (): Promise<RedditPost[]> => {
  const allPosts: RedditPost[] = [];
  
  for (const subreddit of WRESTLING_SUBREDDITS) {
    try {
      console.log(`Fetching Reddit posts from r/${subreddit}...`);
      const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=10`);
      
      if (!response.ok) {
        console.error(`Reddit API error for r/${subreddit}: ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      if (!data.data || !data.data.children) {
        console.error(`No data received from r/${subreddit}`);
        continue;
      }
      
      const posts: RedditPost[] = data.data.children.map((child: any) => ({
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
    .slice(0, 50);
};
