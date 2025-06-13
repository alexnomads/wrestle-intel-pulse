
import { WrestlerMention } from '@/types/wrestlerAnalysis';
import { DetectedStoryline, UnifiedSource } from './unifiedDataService';
import { WrestlerTrend, TrendAlert, StorylineMomentum } from './predictiveAnalyticsService';

// Fallback wrestler mentions for when external data sources fail
export const getFallbackWrestlerMentions = (): WrestlerMention[] => {
  return [
    {
      id: 'fallback-cm-punk-1',
      wrestler_name: 'CM Punk',
      source_type: 'news',
      source_name: 'Wrestling News',
      title: 'CM Punk Returns to WWE',
      url: '#',
      content_snippet: 'CM Punk makes his surprise return to WWE after years away...',
      timestamp: new Date(),
      sentiment_score: 0.8
    },
    {
      id: 'fallback-roman-reigns-1',
      wrestler_name: 'Roman Reigns',
      source_type: 'reddit',
      source_name: 'r/SquaredCircle',
      title: 'Roman Reigns Championship Discussion',
      url: '#',
      content_snippet: 'Discussion about Roman Reigns current championship reign...',
      timestamp: new Date(),
      sentiment_score: 0.7
    },
    {
      id: 'fallback-cody-rhodes-1',
      wrestler_name: 'Cody Rhodes',
      source_type: 'news',
      source_name: 'PWInsider',
      title: 'Cody Rhodes Wins Championship',
      url: '#',
      content_snippet: 'Cody Rhodes finally wins the championship at WrestleMania...',
      timestamp: new Date(),
      sentiment_score: 0.9
    },
    {
      id: 'fallback-seth-rollins-1',
      wrestler_name: 'Seth Rollins',
      source_type: 'reddit',
      source_name: 'r/WWE',
      title: 'Seth Rollins Match Analysis',
      url: '#',
      content_snippet: 'Analysis of Seth Rollins recent performance and storylines...',
      timestamp: new Date(),
      sentiment_score: 0.6
    },
    {
      id: 'fallback-rhea-ripley-1',
      wrestler_name: 'Rhea Ripley',
      source_type: 'news',
      source_name: '411Mania',
      title: 'Rhea Ripley Dominates Division',
      url: '#',
      content_snippet: 'Rhea Ripley continues her dominant run in the womens division...',
      timestamp: new Date(),
      sentiment_score: 0.8
    }
  ];
};

// Fallback storylines for when detection fails
export const getFallbackStorylines = (): DetectedStoryline[] => {
  return [
    {
      id: 'fallback-storyline-1',
      title: 'CM Punk vs Roman Reigns',
      wrestlers: ['CM Punk', 'Roman Reigns'],
      description: 'The returning CM Punk challenges the Tribal Chief',
      intensity: 8,
      sources: [{
        type: 'news',
        title: 'CM Punk Challenges Roman Reigns',
        content: 'CM Punk has set his sights on Roman Reigns championship',
        timestamp: new Date(),
        source: 'Wrestling News'
      }],
      platform: 'mixed'
    },
    {
      id: 'fallback-storyline-2',
      title: 'Cody Rhodes Championship Chase',
      wrestlers: ['Cody Rhodes', 'Seth Rollins'],
      description: 'Cody Rhodes pursues championship gold',
      intensity: 7,
      sources: [{
        type: 'reddit',
        title: 'Cody Rhodes Championship Discussion',
        content: 'Fans discuss Cody Rhodes path to the championship',
        timestamp: new Date(),
        source: 'r/SquaredCircle'
      }],
      platform: 'reddit'
    }
  ];
};

// Fallback unified data sources
export const getFallbackUnifiedSources = (): UnifiedSource[] => {
  return [
    {
      id: 'fallback-news-1',
      type: 'news',
      title: 'WWE Monday Night Raw Results',
      content: 'Full results and highlights from this weeks Monday Night Raw',
      url: '#',
      timestamp: new Date(),
      source: 'Wrestling News',
      sentiment: 0.7,
      engagement: {
        score: 150,
        comments: 45,
        shares: 12
      }
    },
    {
      id: 'fallback-reddit-1',
      type: 'reddit',
      title: 'AEW Dynamite Discussion Thread',
      content: 'Live discussion thread for tonights AEW Dynamite',
      url: '#',
      timestamp: new Date(),
      source: 'r/AEWOfficial',
      sentiment: 0.6,
      engagement: {
        score: 89,
        comments: 234,
        shares: 8
      }
    },
    {
      id: 'fallback-news-2',
      type: 'news',
      title: 'Championship Match Announced',
      content: 'Major championship match announced for upcoming pay-per-view',
      url: '#',
      timestamp: new Date(),
      source: 'PWInsider',
      sentiment: 0.8,
      engagement: {
        score: 200,
        comments: 67,
        shares: 25
      }
    }
  ];
};

// Fallback wrestler trends for predictive analytics
export const getFallbackWrestlerTrends = (): WrestlerTrend[] => {
  return [
    {
      id: 'trend-cm-punk',
      wrestler_name: 'CM Punk',
      current_mentions: 25,
      previous_mentions: 15,
      change_percentage: 67,
      trending_direction: 'rising',
      sentiment_score: 0.8,
      momentum_score: 85,
      timeframe: '24h',
      mention_sources: [
        {
          id: 'cm-punk-mention-1',
          wrestler_name: 'CM Punk',
          source_type: 'news',
          source_name: 'Wrestling News',
          title: 'CM Punk Returns to WWE Programming',
          url: 'https://www.wrestlingnews.co/cm-punk-returns',
          content_snippet: 'CM Punk makes his highly anticipated return to WWE television after years away from the company...',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          sentiment_score: 0.9
        },
        {
          id: 'cm-punk-mention-2',
          wrestler_name: 'CM Punk',
          source_type: 'reddit',
          source_name: 'r/SquaredCircle',
          title: 'CM Punk WWE Return Discussion',
          url: 'https://reddit.com/r/SquaredCircle/comments/cm-punk-return',
          content_snippet: 'Fans react to CM Punk\'s surprise return announcement with overwhelming enthusiasm...',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
          sentiment_score: 0.7
        },
        {
          id: 'cm-punk-mention-3',
          wrestler_name: 'CM Punk',
          source_type: 'news',
          source_name: 'PWInsider',
          title: 'CM Punk Backstage Interview Details',
          url: 'https://pwinsider.com/cm-punk-backstage-interview',
          content_snippet: 'Exclusive details from CM Punk\'s first backstage interview since returning to WWE...',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          sentiment_score: 0.8
        }
      ]
    },
    {
      id: 'trend-roman-reigns',
      wrestler_name: 'Roman Reigns',
      current_mentions: 18,
      previous_mentions: 22,
      change_percentage: -18,
      trending_direction: 'falling',
      sentiment_score: 0.6,
      momentum_score: 72,
      timeframe: '24h',
      mention_sources: [
        {
          id: 'roman-mention-1',
          wrestler_name: 'Roman Reigns',
          source_type: 'news',
          source_name: 'PWInsider',
          title: 'Roman Reigns Championship Reign Analysis',
          url: 'https://pwinsider.com/roman-reigns-championship-analysis',
          content_snippet: 'Analysis of Roman Reigns current championship reign and its impact on WWE programming...',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          sentiment_score: 0.6
        },
        {
          id: 'roman-mention-2',
          wrestler_name: 'Roman Reigns',
          source_type: 'reddit',
          source_name: 'r/WWE',
          title: 'Roman Reigns Match Rating Discussion',
          url: 'https://reddit.com/r/WWE/comments/roman-reigns-match',
          content_snippet: 'Discussion about Roman Reigns recent match performance and fan reactions...',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          sentiment_score: 0.5
        }
      ]
    },
    {
      id: 'trend-cody-rhodes',
      wrestler_name: 'Cody Rhodes',
      current_mentions: 20,
      previous_mentions: 12,
      change_percentage: 67,
      trending_direction: 'rising',
      sentiment_score: 0.85,
      momentum_score: 88,
      timeframe: '24h',
      mention_sources: [
        {
          id: 'cody-mention-1',
          wrestler_name: 'Cody Rhodes',
          source_type: 'news',
          source_name: '411Mania',
          title: 'Cody Rhodes Championship Victory Celebration',
          url: 'https://411mania.com/cody-rhodes-championship',
          content_snippet: 'Cody Rhodes celebrates his championship victory with an emotional speech to the WWE Universe...',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          sentiment_score: 0.9
        },
        {
          id: 'cody-mention-2',
          wrestler_name: 'Cody Rhodes',
          source_type: 'reddit',
          source_name: 'r/SquaredCircle',
          title: 'Cody Rhodes Story Completion Thread',
          url: 'https://reddit.com/r/SquaredCircle/comments/cody-story-complete',
          content_snippet: 'Fans celebrate Cody Rhodes finally completing his story with championship gold...',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          sentiment_score: 0.8
        }
      ]
    }
  ];
};

// Enhanced fallback trend alerts with realistic mention sources
export const getFallbackTrendAlerts = (): TrendAlert[] => {
  return [
    {
      id: 'alert-cm-punk-surge',
      type: 'trend_spike',
      severity: 'critical',
      title: 'CM Punk Mention Surge',
      description: 'CM Punk\'s mentions increased 150% in 24h following return announcement',
      wrestler_name: 'CM Punk',
      timestamp: new Date(),
      data: {
        change_percentage: 150,
        current_value: 25,
        previous_value: 10,
        timeframe: '24h'
      },
      mention_sources: [
        {
          id: 'cm-punk-alert-mention-1',
          wrestler_name: 'CM Punk',
          source_type: 'news',
          source_name: 'Wrestling Observer',
          title: 'CM Punk Returns to WWE After 10 Years',
          url: 'https://wrestlingobserver.com/cm-punk-returns-wwe',
          content_snippet: 'Breaking: CM Punk has officially returned to WWE programming after a decade-long absence from the company...',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          sentiment_score: 0.9
        },
        {
          id: 'cm-punk-alert-mention-2',
          wrestler_name: 'CM Punk',
          source_type: 'reddit',
          source_name: 'r/SquaredCircle',
          title: 'CM PUNK IS BACK!! - Live Thread',
          url: 'https://reddit.com/r/SquaredCircle/comments/cm-punk-back-live',
          content_snippet: 'HOLY SHIT! CM Punk just showed up on WWE programming! The crowd is going absolutely insane right now...',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          sentiment_score: 0.95
        },
        {
          id: 'cm-punk-alert-mention-3',
          wrestler_name: 'CM Punk',
          source_type: 'news',
          source_name: 'PWTorch',
          title: 'CM Punk WWE Contract Details Revealed',
          url: 'https://pwtorch.com/cm-punk-contract-details',
          content_snippet: 'Sources close to the situation reveal details about CM Punk\'s new WWE contract and his role going forward...',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          sentiment_score: 0.8
        },
        {
          id: 'cm-punk-alert-mention-4',
          wrestler_name: 'CM Punk',
          source_type: 'reddit',
          source_name: 'r/WWE',
          title: 'CM Punk Return Megathread',
          url: 'https://reddit.com/r/WWE/comments/cm-punk-return-mega',
          content_snippet: 'Official megathread for discussing CM Punk\'s shocking return to WWE. Share your reactions and thoughts here...',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          sentiment_score: 0.85
        }
      ]
    },
    {
      id: 'alert-cody-championship',
      type: 'storyline_momentum',
      severity: 'high',
      title: 'Championship Storyline Gaining Momentum',
      description: 'Cody Rhodes championship storyline activity increased 85% across 3 platforms',
      storyline_id: 'cody-championship-story',
      timestamp: new Date(),
      data: {
        change_percentage: 85,
        current_value: 12,
        previous_value: 7,
        timeframe: '24h'
      },
      mention_sources: [
        {
          id: 'cody-story-mention-1',
          wrestler_name: 'Cody Rhodes',
          source_type: 'news',
          source_name: 'Fightful',
          title: 'Cody Rhodes Championship Ceremony Announced',
          url: 'https://fightful.com/cody-rhodes-championship-ceremony',
          content_snippet: 'WWE announces a special championship ceremony for Cody Rhodes on next week\'s Monday Night Raw...',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          sentiment_score: 0.8
        },
        {
          id: 'cody-story-mention-2',
          wrestler_name: 'Cody Rhodes',
          source_type: 'reddit',
          source_name: 'r/WWE',
          title: 'Cody Rhodes Championship Celebration',
          url: 'https://reddit.com/r/WWE/comments/cody-championship-celebration',
          content_snippet: 'Fans celebrate Cody Rhodes finally winning the championship and completing his story...',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          sentiment_score: 0.9
        },
        {
          id: 'cody-story-mention-3',
          wrestler_name: 'Cody Rhodes',
          source_type: 'news',
          source_name: 'Wrestling Inc',
          title: 'Cody Rhodes First Title Defense Opponent Revealed',
          url: 'https://wrestlinginc.com/cody-rhodes-first-defense',
          content_snippet: 'WWE reveals the opponent for Cody Rhodes\' first championship defense at the upcoming premium live event...',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
          sentiment_score: 0.75
        }
      ]
    },
    {
      id: 'alert-rhea-ripley-sentiment',
      type: 'sentiment_shift',
      severity: 'medium',
      title: 'Rhea Ripley Positive Sentiment Spike',
      description: 'Rhea Ripley\'s sentiment score increased 120% following dominant performance',
      wrestler_name: 'Rhea Ripley',
      timestamp: new Date(),
      data: {
        change_percentage: 120,
        current_value: 8,
        previous_value: 4,
        timeframe: '24h'
      },
      mention_sources: [
        {
          id: 'rhea-sentiment-mention-1',
          wrestler_name: 'Rhea Ripley',
          source_type: 'news',
          source_name: 'ComicBook.com',
          title: 'Rhea Ripley Delivers Standout Performance',
          url: 'https://comicbook.com/rhea-ripley-standout-performance',
          content_snippet: 'Rhea Ripley delivered a career-defining performance that has fans and critics praising her evolution...',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          sentiment_score: 0.85
        },
        {
          id: 'rhea-sentiment-mention-2',
          wrestler_name: 'Rhea Ripley',
          source_type: 'reddit',
          source_name: 'r/SquaredCircle',
          title: 'Rhea Ripley Appreciation Post',
          url: 'https://reddit.com/r/SquaredCircle/comments/rhea-appreciation',
          content_snippet: 'Can we take a moment to appreciate how far Rhea Ripley has come? Her character work is incredible...',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          sentiment_score: 0.9
        }
      ]
    }
  ];
};

// Fallback storyline momentum data
export const getFallbackStorylineMomentum = (): StorylineMomentum[] => {
  return [
    {
      id: 'storyline-cm-punk-return',
      storyline_title: 'CM Punk WWE Return',
      wrestlers_involved: ['CM Punk', 'Seth Rollins'],
      momentum_score: 92,
      engagement_trend: 'increasing',
      platforms: ['news', 'reddit'],
      key_events: ['Return announcement', 'First match back', 'Backstage interview'],
      related_sources: [
        {
          title: 'CM Punk Returns to WWE',
          url: '#',
          source_type: 'news',
          source_name: 'Wrestling News',
          timestamp: new Date(),
          content_snippet: 'CM Punk makes his return to WWE after a decade away...'
        }
      ]
    },
    {
      id: 'storyline-championship-chase',
      storyline_title: 'Championship Picture',
      wrestlers_involved: ['Cody Rhodes', 'Roman Reigns', 'Seth Rollins'],
      momentum_score: 78,
      engagement_trend: 'stable',
      platforms: ['news', 'reddit'],
      key_events: ['Title match announced', 'Contract signing', 'Press conference'],
      related_sources: [
        {
          title: 'Championship Match Set for Next Event',
          url: '#',
          source_type: 'news',
          source_name: 'PWInsider',
          timestamp: new Date(),
          content_snippet: 'The championship picture becomes clearer with new match announcement...'
        }
      ]
    }
  ];
};
