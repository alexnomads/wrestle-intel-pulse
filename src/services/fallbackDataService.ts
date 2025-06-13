
import { WrestlerMention } from '@/types/wrestlerAnalysis';
import { DetectedStoryline, UnifiedDataSource } from './unifiedDataService';

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
