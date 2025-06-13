
// Twitter API v2 service with proper rate limiting and error handling
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
  isFallback?: boolean;
}

// Comprehensive wrestling accounts to monitor (80+ accounts)
const WRESTLING_ACCOUNTS = [
  // Original core accounts
  'WWE',
  'AEW', 
  'SeanRossSapp',
  'WrestleVotes',
  'davemeltzerWON',
  'ryansatin',
  'MikeJohnson_pwtorch',
  
  // Major Wrestling Stars
  'TrueKofi',
  'joehendry',
  'briancagegmsi',
  'JohnCena',
  'LanceHoyt',
  'theflipgordon',
  'Therealrvd',
  'nikkita_wwe',
  'ZelinaVegaWWE',
  'realkillerkross',
  'MiaYim',
  'RefBaeDaphWWE',
  'SpeedballBailey',
  'TheLethalJay',
  'TheREALRIKISHI',
  'RealBillyGunn',
  'theraveneffect',
  'RealDDP',
  'ScottSteiner',
  'zena_wwe',
  'TheTrinity_Fatu',
  'TheDariaRae',
  'RealIslaDawn',
  'BlakeMonroeWWE',
  'Steph_Vaquer',
  'kelani_wwe',
  'RealKingRegal',
  '_Theory1',
  'PeteDunneYxB',
  'SuperKingofBros',
  'Aleister_Blxck',
  'TheSamiCallihan',
  'DEATHxWALKS',
  'RicFlairNatrBoy',
  'StuBennett',
  'BronsonIsHere',
  'RealJakeHager',
  'Ivar_WWE',
  'TheGiantOmos',
  'CiampaWWE',
  'TheRock',
  'eric_bugenhagen',
  'realboogey',
  'ShawnMichaels',
  'steveaustinBSR',
  'TheMarkHenry',
  'JerryLawler',
  'catherinekelley',
  'mikethemiz',
  'MustafaAli_X',
  'RealKurtAngle',
  'WWEGable',
  's_d_naito',
  'KingRicochet',
  'Christian4Peeps',
  'TheAdamPages',
  'THETOMMYDREAMER',
  'otiswwe',
  'AJStylesOrg',
  'WWESheamus',
  'FightOwensFight',
  'WWENikkiCross',
  'TheMattCardona',
  'realkevinkelly',
  'TheKingOfStrong',
  'RealNickAldis',
  'RealJeffJarrett',
  
  // Wrestling News & Media
  'WrestleNotice',
  'WrestleTubePC',
  'FanSidedDDT',
  'WrestlingInc',
  'AEWonTV',
  'Fightful',
  'IamAllElite',
  'WrestlePurists',
  'WWEItalia',
  'TNADixie',
  'WrestleTix',
  'WrestleFeatures',
  'BustedOpenRadio',
  'AEWNeckbeard',
  'ThisIsTNA',
  'WWEVacant',
  'WrestlingCovers',
  
  // Wrestling Personalities & Legends
  'TheJimCornette',
  'THEVinceRusso',
  'tanahashi1_100',
  'EBischoff',
  'TheHypeManAlex',
  
  // Wrestling Fans & Communities
  'ChandranTheMan',
  'moyscharles03',
  'ArmbarsNCigars',
  'ChiefsMuseee',
  'wittyjack__',
  'TurpTime84',
  'MrMrWolf4',
  'AllEliteSicko',
  'Alexa518970',
  'riveraJonath949',
  'ScrapDaddyAP',
  'Thecoachrules',
  'toxic_thekla',
  'PatrullaBCN',
  'NemexyxOfficial',
  'jnmegatron',
  'ARealFoxx',
  'SamanthaTheBomb',
  'Litocolon279',
  'JakeSnakeDDT',
  'goat_sdk',
  'farouq_x10',
  'jesting_jester',
  'CNote577',
  'rayodebarro',
  'ItsNekeym',
  'ROJOasis',
  'robertopampa9',
  'Carloalvino',
  '_Iam_Elijah_',
  'GREATBLACKOTAKU',
  'Sheltyb803',
  'Thewrestlingin1',
  'jhal02',
  'Jascha421',
  'ryrynemnem',
  'reigns_era',
  'ineed2pi',
  'TheMinister',
  'TheCaZXL',
  'TheRealIceman'
];

class TwitterServiceWithRateLimit {
  private lastRequestTime = 0;
  private requestCount = 0;
  private windowStart = Date.now();
  private readonly RATE_LIMIT = 200; // Reduced to handle more accounts safely
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly REQUEST_DELAY = 3000; // 3 seconds between requests (slower for more accounts)

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Reset window if needed
    if (now - this.windowStart >= this.WINDOW_MS) {
      this.requestCount = 0;
      this.windowStart = now;
    }

    // Check if we're at rate limit
    if (this.requestCount >= this.RATE_LIMIT) {
      const waitTime = this.WINDOW_MS - (now - this.windowStart);
      console.log(`Rate limit reached, waiting ${waitTime}ms`);
      await this.delay(waitTime);
      this.requestCount = 0;
      this.windowStart = Date.now();
    }

    // Ensure minimum delay between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      await this.delay(this.REQUEST_DELAY - timeSinceLastRequest);
    }

    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  private async fetchAccountTweets(username: string): Promise<any[]> {
    try {
      await this.enforceRateLimit();

      const response = await fetch('https://wavxulotmntdtixcpzik.supabase.co/functions/v1/twitter-wrestling-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          accounts: [username],
          rateLimited: true 
        })
      });

      if (response.status === 429) {
        console.log(`Rate limited for ${username}, skipping...`);
        return [];
      }

      if (!response.ok) {
        console.warn(`Failed to fetch tweets for ${username}: ${response.status}`);
        return [];
      }

      const data = await response.json();
      return data.tweets || [];
    } catch (error) {
      console.error(`Error fetching tweets for ${username}:`, error);
      return [];
    }
  }

  private formatTweets(tweets: any[]): TwitterPost[] {
    return tweets.map(tweet => ({
      id: tweet.id,
      text: tweet.text,
      author: tweet.author?.username || 'Unknown',
      timestamp: new Date(tweet.created_at),
      engagement: {
        likes: tweet.public_metrics?.like_count || 0,
        retweets: tweet.public_metrics?.retweet_count || 0,
        replies: tweet.public_metrics?.reply_count || 0
      },
      url: `https://twitter.com/${tweet.author?.username}/status/${tweet.id}`
    }));
  }

  private getMinimalFallback(): TwitterPost[] {
    return [
      {
        id: 'fallback_twitter_1',
        text: `Wrestling news updates available - Twitter API temporarily unavailable (monitoring ${WRESTLING_ACCOUNTS.length} accounts)`,
        author: 'System',
        timestamp: new Date(),
        engagement: { likes: 0, retweets: 0, replies: 0 },
        url: '#',
        isFallback: true
      }
    ];
  }

  async fetchWrestlingTweets(): Promise<TwitterPost[]> {
    try {
      console.log(`Fetching wrestling tweets from ${WRESTLING_ACCOUNTS.length} accounts with rate limiting...`);
      const results: any[] = [];

      // Process a subset of accounts per cycle to manage rate limits
      const accountsPerCycle = 10; // Process 10 accounts at a time
      const cycleStartIndex = Math.floor(Date.now() / (60 * 1000)) % Math.ceil(WRESTLING_ACCOUNTS.length / accountsPerCycle);
      const startIndex = cycleStartIndex * accountsPerCycle;
      const endIndex = Math.min(startIndex + accountsPerCycle, WRESTLING_ACCOUNTS.length);
      
      const accountsToProcess = WRESTLING_ACCOUNTS.slice(startIndex, endIndex);
      console.log(`Processing accounts ${startIndex + 1}-${endIndex} of ${WRESTLING_ACCOUNTS.length}: ${accountsToProcess.join(', ')}`);

      // Process selected accounts sequentially to avoid rate limits
      for (const account of accountsToProcess) {
        const tweets = await this.fetchAccountTweets(account);
        if (tweets && tweets.length > 0) {
          results.push(...tweets.slice(0, 3)); // Limit to 3 tweets per account
        }
      }

      if (results.length === 0) {
        console.log('No tweets fetched, using minimal fallback');
        return this.getMinimalFallback();
      }

      const formattedTweets = this.formatTweets(results);
      console.log(`Successfully fetched ${formattedTweets.length} tweets from ${accountsToProcess.length} accounts`);
      return formattedTweets;

    } catch (error) {
      console.error('Twitter service error:', error);
      return this.getMinimalFallback();
    }
  }
}

const twitterService = new TwitterServiceWithRateLimit();

export const fetchWrestlingTweets = () => twitterService.fetchWrestlingTweets();
