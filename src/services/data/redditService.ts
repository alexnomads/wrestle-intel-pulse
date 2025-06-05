
import { RedditPost } from './dataTypes';

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
