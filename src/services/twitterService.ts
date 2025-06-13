
// Twitter API v2 service with improved rate limiting and error handling
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
  // Core wrestling federations and news
  'WWE',
  'AEW', 
  'SeanRossSapp',
  'WrestleVotes',
  'davemeltzerWON',
  'ryansatin',
  'MikeJohnson_pwtorch',
  'WrestlingInc',
  'Fightful',
  
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
  'AEWonTV',
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
  
  // Wrestling Community
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
  private readonly RATE_LIMIT = 50; // Much more conservative rate limit
  private readonly WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  private readonly REQUEST_DELAY = 10000; // 10 seconds between requests (much slower)
  private readonly MAX_ACCOUNTS_PER_CYCLE = 5; // Only process 5 accounts at a time
  private cycleOffset = 0; // Track which accounts we're currently processing

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    
    // Reset window if needed
    if (now - this.windowStart >= this.WINDOW_MS) {
      this.requestCount = 0;
      this.windowStart = now;
      console.log('Rate limit window reset');
    }

    // Check if we're at rate limit
    if (this.requestCount >= this.RATE_LIMIT) {
      const waitTime = this.WINDOW_MS - (now - this.windowStart);
      console.log(`Rate limit reached (${this.requestCount}/${this.RATE_LIMIT}), waiting ${Math.round(waitTime/1000)}s`);
      await this.delay(waitTime + 1000); // Add extra second buffer
      this.requestCount = 0;
      this.windowStart = Date.now();
    }

    // Ensure minimum delay between requests
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      const delayNeeded = this.REQUEST_DELAY - timeSinceLastRequest;
      console.log(`Enforcing delay: ${Math.round(delayNeeded/1000)}s`);
      await this.delay(delayNeeded);
    }

    this.requestCount++;
    this.lastRequestTime = Date.now();
  }

  private async fetchAccountTweets(username: string): Promise<any[]> {
    try {
      await this.enforceRateLimit();

      console.log(`Attempting to fetch tweets for @${username}`);
      
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
        console.log(`Rate limited for ${username}, skipping for this cycle`);
        return [];
      }

      if (!response.ok) {
        console.warn(`Failed to fetch tweets for ${username}: ${response.status} ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      const tweets = data.tweets || [];
      
      if (tweets.length > 0) {
        console.log(`✅ Successfully fetched ${tweets.length} tweets from @${username}`);
      } else {
        console.log(`No tweets returned for @${username}`);
      }
      
      return tweets;
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

  private getProgressiveFallback(): TwitterPost[] {
    const totalAccounts = WRESTLING_ACCOUNTS.length;
    const currentCycle = Math.floor(this.cycleOffset / this.MAX_ACCOUNTS_PER_CYCLE) + 1;
    const totalCycles = Math.ceil(totalAccounts / this.MAX_ACCOUNTS_PER_CYCLE);
    
    return [
      {
        id: 'fallback_progressive_1',
        text: `🔄 Cycling through wrestling accounts (${this.MAX_ACCOUNTS_PER_CYCLE} per cycle) to respect Twitter rate limits. Currently on cycle ${currentCycle}/${totalCycles}.`,
        author: 'System',
        timestamp: new Date(),
        engagement: { likes: 0, retweets: 0, replies: 0 },
        url: '#',
        isFallback: true
      },
      {
        id: 'fallback_progressive_2',
        text: `📊 Monitoring ${totalAccounts} wrestling accounts total. System automatically cycles to avoid rate limits and ensure data freshness.`,
        author: 'WrestlingHub',
        timestamp: new Date(Date.now() - 60000),
        engagement: { likes: 0, retweets: 0, replies: 0 },
        url: '#',
        isFallback: true
      }
    ];
  }

  async fetchWrestlingTweets(): Promise<TwitterPost[]> {
    try {
      const totalAccounts = WRESTLING_ACCOUNTS.length;
      console.log(`🎯 Starting Twitter fetch cycle for ${totalAccounts} total accounts`);
      
      // Select a small subset of accounts for this cycle
      const startIndex = this.cycleOffset % totalAccounts;
      const endIndex = Math.min(startIndex + this.MAX_ACCOUNTS_PER_CYCLE, totalAccounts);
      
      let accountsToProcess: string[];
      if (endIndex <= totalAccounts) {
        accountsToProcess = WRESTLING_ACCOUNTS.slice(startIndex, endIndex);
      } else {
        // Handle wrap-around
        accountsToProcess = [
          ...WRESTLING_ACCOUNTS.slice(startIndex),
          ...WRESTLING_ACCOUNTS.slice(0, endIndex - totalAccounts)
        ];
      }
      
      console.log(`📋 Processing accounts ${startIndex + 1}-${endIndex} of ${totalAccounts}: ${accountsToProcess.join(', ')}`);
      
      const results: any[] = [];
      let successfulFetches = 0;

      // Process accounts sequentially with proper delays
      for (const account of accountsToProcess) {
        const tweets = await this.fetchAccountTweets(account);
        if (tweets && tweets.length > 0) {
          results.push(...tweets.slice(0, 2)); // Limit to 2 tweets per account
          successfulFetches++;
        }
      }

      // Update cycle offset for next request
      this.cycleOffset = (this.cycleOffset + this.MAX_ACCOUNTS_PER_CYCLE) % totalAccounts;

      if (results.length === 0) {
        console.log(`⚠️ No tweets fetched from ${accountsToProcess.length} accounts, using progressive fallback`);
        return this.getProgressiveFallback();
      }

      const formattedTweets = this.formatTweets(results);
      console.log(`✅ Successfully processed ${formattedTweets.length} tweets from ${successfulFetches}/${accountsToProcess.length} accounts`);
      
      return formattedTweets;

    } catch (error) {
      console.error('Twitter service error:', error);
      return this.getProgressiveFallback();
    }
  }
}

const twitterService = new TwitterServiceWithRateLimit();

export const fetchWrestlingTweets = () => twitterService.fetchWrestlingTweets();
