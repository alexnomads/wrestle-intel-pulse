import { WrestlerMention } from '@/types/wrestlerAnalysis';
import { DetectedStoryline, UnifiedDataSource } from './unifiedDataService';
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
export const getFallbackUnifiedSources = (): UnifiedDataSource[] => {
  return [
    {
      type: 'news',
      title: 'WWE Monday Night Raw Results',
      content: 'Full results and highlights from this weeks Monday Night Raw',
      url: '#',
      timestamp: new Date(),
      source: 'Wrestling News',
      engagement: {
        score: 150,
        comments: 45
      }
    },
    {
      type: 'reddit',
      title: 'AEW Dynamite Discussion Thread',
      content: 'Live discussion thread for tonights AEW Dynamite',
      url: '#',
      timestamp: new Date(),
      source: 'r/AEWOfficial',
      engagement: {
        score: 89,
        comments: 234
      }
    },
    {
      type: 'news',
      title: 'Championship Match Announced',
      content: 'Major championship match announced for upcoming pay-per-view',
      url: '#',
      timestamp: new Date(),
      source: 'PWInsider',
      engagement: {
        score: 200,
        comments: 67
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
          url: '#',
          content_snippet: 'CM Punk makes his highly anticipated return to WWE television...',
          timestamp: new Date(),
          sentiment_score: 0.9
        },
        {
          id: 'cm-punk-mention-2',
          wrestler_name: 'CM Punk',
          source_type: 'reddit',
          source_name: 'r/SquaredCircle',
          title: 'CM Punk WWE Return Discussion',
          url: '#',
          content_snippet: 'Fans react to CM Punk\'s surprise return announcement...',
          timestamp: new Date(),
          sentiment_score: 0.7
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
          title: 'Roman Reigns Championship Reign Continues',
          url: '#',
          content_snippet: 'Roman Reigns defends his championship in a hard-fought match...',
          timestamp: new Date(),
          sentiment_score: 0.6
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
          title: 'Cody Rhodes Wins Championship at WrestleMania',
          url: '#',
          content_snippet: 'Cody Rhodes finally completes his story with championship victory...',
          timestamp: new Date(),
          sentiment_score: 0.9
        }
      ]
    }
  ];
};

// Fallback trend alerts
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
          url: '#',
          content_snippet: 'Breaking: CM Punk has officially returned to WWE programming...',
          timestamp: new Date(),
          sentiment_score: 0.9
        }
      ]
    },
    {
      id: 'alert-cody-championship',
      type: 'storyline_momentum',
      severity: 'high',
      title: 'Championship Storyline Gaining Momentum',
      description: 'Cody Rhodes championship storyline activity is increasing across 3 platforms',
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
          source_type: 'reddit',
          source_name: 'r/WWE',
          title: 'Cody Rhodes Championship Celebration',
          url: '#',
          content_snippet: 'Fans celebrate Cody Rhodes finally winning the championship...',
          timestamp: new Date(),
          sentiment_score: 0.8
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
