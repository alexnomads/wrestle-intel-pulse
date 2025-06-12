
// Mock Twitter service - In production, you'd need Twitter API access
export interface TwitterPost {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
  engagement: {
    likes: number;
    retweets: number;
    replies: number;
  };
  url: string;
}

export const fetchWrestlingTweets = async (): Promise<TwitterPost[]> => {
  // Mock Twitter data for demonstration
  // In production, this would use Twitter API v2
  const mockTweets: TwitterPost[] = [
    {
      id: '1',
      text: 'CM Punk return to WWE is still the biggest story in wrestling. The crowd reactions have been incredible! #WWE #CMPunk',
      author: '@WrestlingFan2024',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      engagement: { likes: 142, retweets: 38, replies: 15 },
      url: 'https://twitter.com/WrestlingFan2024/status/1'
    },
    {
      id: '2',
      text: 'Roman Reigns vs Cody Rhodes storyline continues to build momentum. The tribal chief is not done yet! #WWE #RomanReigns',
      author: '@TribalCombat',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      engagement: { likes: 89, retweets: 23, replies: 8 },
      url: 'https://twitter.com/TribalCombat/status/2'
    },
    {
      id: '3',
      text: 'Jon Moxley bringing that wild energy to AEW Dynamite tonight. This man is unhinged! #AEW #JonMoxley',
      author: '@AEWUpdates',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      engagement: { likes: 167, retweets: 45, replies: 22 },
      url: 'https://twitter.com/AEWUpdates/status/3'
    },
    {
      id: '4',
      text: 'Rhea Ripley dominating the women\'s division like no one else. Pure dominance! #WWE #RheaRipley #WomensWrestling',
      author: '@DominanceEra',
      timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
      engagement: { likes: 203, retweets: 67, replies: 31 },
      url: 'https://twitter.com/DominanceEra/status/4'
    },
    {
      id: '5',
      text: 'Kenny Omega return speculation continues. AEW needs their cleaner back! #AEW #KennyOmega',
      author: '@EliteWrestling',
      timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
      engagement: { likes: 94, retweets: 28, replies: 12 },
      url: 'https://twitter.com/EliteWrestling/status/5'
    },
    {
      id: '6',
      text: 'Gunther\'s reign as Intercontinental Champion has been legendary. Ring General! #WWE #Gunther',
      author: '@ChampionshipWatch',
      timestamp: new Date(Date.now() - 1000 * 60 * 150), // 2.5 hours ago
      engagement: { likes: 156, retweets: 41, replies: 19 },
      url: 'https://twitter.com/ChampionshipWatch/status/6'
    }
  ];

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  console.log(`Fetched ${mockTweets.length} wrestling tweets from Twitter`);
  return mockTweets;
};
