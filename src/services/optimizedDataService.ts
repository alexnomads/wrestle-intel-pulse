
interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  ttl: number; // Time to live in milliseconds
}

interface DataSourceResult<T> {
  source: string;
  data: T;
  success: boolean;
  loadTime: number;
  error?: string;
}

class SmartCache {
  private cache = new Map<string, CacheEntry<any>>();
  
  set<T>(key: string, data: T, ttlMinutes: number): void {
    this.cache.set(key, {
      data,
      timestamp: new Date(),
      ttl: ttlMinutes * 60 * 1000
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = new Date().getTime();
    const entryTime = entry.timestamp.getTime();
    
    if (now - entryTime > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  isStale(key: string, staleTimeMinutes: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    
    const now = new Date().getTime();
    const entryTime = entry.timestamp.getTime();
    
    return now - entryTime > staleTimeMinutes * 60 * 1000;
  }
  
  clear(): void {
    this.cache.clear();
  }
}

export const smartCache = new SmartCache();

// Performance monitoring
class PerformanceMonitor {
  private metrics = new Map<string, number[]>();
  
  recordLoadTime(source: string, loadTime: number): void {
    if (!this.metrics.has(source)) {
      this.metrics.set(source, []);
    }
    
    const times = this.metrics.get(source)!;
    times.push(loadTime);
    
    // Keep only last 10 measurements
    if (times.length > 10) {
      times.shift();
    }
  }
  
  getAverageLoadTime(source: string): number {
    const times = this.metrics.get(source);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }
  
  getSlowSources(thresholdMs: number = 5000): string[] {
    const slowSources: string[] = [];
    
    for (const [source, times] of this.metrics.entries()) {
      const avgTime = this.getAverageLoadTime(source);
      if (avgTime > thresholdMs) {
        slowSources.push(source);
      }
    }
    
    return slowSources;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Optimized data fetching with parallel processing
export async function fetchDataWithFallback<T>(
  fetchFn: () => Promise<T>,
  source: string,
  timeoutMs: number = 3000
): Promise<DataSourceResult<T>> {
  const startTime = Date.now();
  
  try {
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    );
    
    const data = await Promise.race([fetchFn(), timeoutPromise]);
    const loadTime = Date.now() - startTime;
    
    performanceMonitor.recordLoadTime(source, loadTime);
    
    return {
      source,
      data,
      success: true,
      loadTime
    };
  } catch (error) {
    const loadTime = Date.now() - startTime;
    
    return {
      source,
      data: null as T,
      success: false,
      loadTime,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Fast parallel data fetching
export async function fetchAllDataParallel() {
  const cacheKey = 'unified-data';
  const cachedData = smartCache.get(cacheKey);
  
  // Return cached data immediately if available
  if (cachedData && !smartCache.isStale(cacheKey, 2)) {
    console.log('🚀 Returning cached data for instant load');
    return {
      ...cachedData,
      fromCache: true
    };
  }
  
  console.log('🔄 Fetching fresh data in parallel...');
  
  // Import services dynamically to avoid blocking
  const [
    { fetchRSSFeeds },
    { fetchRedditPosts },
    { fetchWrestlingTweets },
    { fetchWrestlingVideos }
  ] = await Promise.all([
    import('./data/rssService'),
    import('./data/redditService'),
    import('./twitterService'),
    import('./youtubeService')
  ]);
  
  // Fetch all sources in parallel with individual timeouts
  const dataPromises = [
    fetchDataWithFallback(() => fetchRSSFeeds(), 'rss', 4000),
    fetchDataWithFallback(() => fetchRedditPosts(), 'reddit', 3000),
    fetchDataWithFallback(() => fetchWrestlingTweets(), 'twitter', 2000),
    fetchDataWithFallback(() => fetchWrestlingVideos(), 'youtube', 3000)
  ];
  
  const results = await Promise.allSettled(dataPromises);
  
  // Process results and extract data safely
  const getDataFromResult = (result: PromiseSettledResult<DataSourceResult<any>>) => {
    if (result.status === 'fulfilled' && result.value.success && Array.isArray(result.value.data)) {
      return result.value.data;
    }
    return [];
  };
  
  const getLoadTimeFromResult = (result: PromiseSettledResult<DataSourceResult<any>>) => {
    return result.status === 'fulfilled' ? result.value.loadTime : 0;
  };
  
  const combinedData = {
    newsItems: getDataFromResult(results[0]),
    redditPosts: getDataFromResult(results[1]),
    tweets: getDataFromResult(results[2]),
    videos: getDataFromResult(results[3]),
    lastUpdated: new Date(),
    loadTimes: {
      rss: getLoadTimeFromResult(results[0]),
      reddit: getLoadTimeFromResult(results[1]),
      twitter: getLoadTimeFromResult(results[2]),
      youtube: getLoadTimeFromResult(results[3])
    },
    fromCache: false
  };
  
  // Cache the fresh data
  smartCache.set(cacheKey, combinedData, 10); // 10 minute TTL
  
  console.log('✅ Fresh data fetched and cached:', {
    newsItems: combinedData.newsItems.length,
    redditPosts: combinedData.redditPosts.length,
    tweets: combinedData.tweets.length,
    videos: combinedData.videos.length,
    loadTimes: combinedData.loadTimes
  });
  
  return combinedData;
}
