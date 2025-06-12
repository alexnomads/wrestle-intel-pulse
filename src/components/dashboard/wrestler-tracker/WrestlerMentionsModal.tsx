
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, TrendingUp, MessageCircle } from 'lucide-react';
import { NewsItem } from '@/services/data/dataTypes';

interface WrestlerMentionsModalProps {
  wrestler: {
    id: string;
    wrestler_name: string;
    promotion: string;
    totalMentions: number;
    sentimentScore: number;
    relatedNews?: NewsItem[];
  };
  newsItems: NewsItem[];
  onClose: () => void;
}

// Improved wrestler name matching function - same as used in analysis service
const isWrestlerMentioned = (wrestlerName: string, content: string): boolean => {
  const normalizedWrestlerName = wrestlerName.toLowerCase().trim();
  const normalizedContent = content.toLowerCase();
  
  // Split wrestler name into parts
  const nameParts = normalizedWrestlerName.split(' ').filter(part => part.length > 0);
  
  // For single names (rare), require exact match with word boundaries
  if (nameParts.length === 1) {
    const singleName = nameParts[0];
    // Only match if it's a distinctive name (more than 3 characters) and appears as a whole word
    if (singleName.length > 3) {
      const regex = new RegExp(`\\b${singleName}\\b`, 'i');
      return regex.test(normalizedContent);
    }
    return false;
  }
  
  // For multi-part names, use a more flexible approach
  if (nameParts.length >= 2) {
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    // Check for exact full name match first (highest priority)
    const fullNameRegex = new RegExp(`\\b${normalizedWrestlerName.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (fullNameRegex.test(normalizedContent)) {
      return true;
    }
    
    // Check for "First Last" pattern (most common)
    const firstLastRegex = new RegExp(`\\b${firstName}\\s+${lastName}\\b`, 'i');
    if (firstLastRegex.test(normalizedContent)) {
      return true;
    }
    
    // For unique combinations, check if both names appear (with more distance allowed)
    const firstNameRegex = new RegExp(`\\b${firstName}\\b`, 'i');
    const lastNameRegex = new RegExp(`\\b${lastName}\\b`, 'i');
    
    const hasFirstName = firstNameRegex.test(normalizedContent);
    const hasLastName = lastNameRegex.test(normalizedContent);
    
    if (hasFirstName && hasLastName) {
      // Check if this is a unique enough combination to avoid false positives
      // Common first names that need stricter matching
      const commonFirstNames = ['adam', 'john', 'mike', 'chris', 'kevin', 'matt', 'mark', 'steve', 'daniel', 'bryan'];
      
      if (commonFirstNames.includes(firstName)) {
        // For common first names, require closer proximity (within 50 characters)
        const firstNameMatch = normalizedContent.match(firstNameRegex);
        const lastNameMatch = normalizedContent.match(lastNameRegex);
        
        if (firstNameMatch && lastNameMatch) {
          const firstNameIndex = normalizedContent.indexOf(firstNameMatch[0]);
          const lastNameIndex = normalizedContent.indexOf(lastNameMatch[0]);
          const distance = Math.abs(firstNameIndex - lastNameIndex);
          
          return distance <= 50;
        }
      } else {
        // For unique first names, allow more distance (within 150 characters)
        const firstNameMatch = normalizedContent.match(firstNameRegex);
        const lastNameMatch = normalizedContent.match(lastNameRegex);
        
        if (firstNameMatch && lastNameMatch) {
          const firstNameIndex = normalizedContent.indexOf(firstNameMatch[0]);
          const lastNameIndex = normalizedContent.indexOf(lastNameMatch[0]);
          const distance = Math.abs(firstNameIndex - lastNameIndex);
          
          return distance <= 150;
        }
      }
    }
    
    // Check for common wrestling name patterns
    // "Lastname" only for distinctive surnames
    if (lastName.length > 5 && !['johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis'].includes(lastName)) {
      const lastNameOnlyRegex = new RegExp(`\\b${lastName}\\b`, 'i');
      if (lastNameOnlyRegex.test(normalizedContent)) {
        return true;
      }
    }
  }
  
  return false;
};

export const WrestlerMentionsModal = ({ wrestler, newsItems, onClose }: WrestlerMentionsModalProps) => {
  // Filter news items that mention this wrestler using the same logic as the analysis service
  const wrestlerMentions = newsItems.filter(item => {
    const content = `${item.title} ${item.contentSnippet || ''}`;
    return isWrestlerMentioned(wrestler.wrestler_name, content);
  });

  console.log(`Filtering mentions for ${wrestler.wrestler_name}:`, {
    totalNewsItems: newsItems.length,
    foundMentions: wrestlerMentions.length,
    mentions: wrestlerMentions.map(item => item.title)
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <span className="text-xl">{wrestler.wrestler_name} Mentions</span>
            <Badge variant="secondary">{wrestler.promotion}</Badge>
            <Badge variant="outline" className="bg-wrestling-electric/10 text-wrestling-electric">
              {wrestler.totalMentions} mentions
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-wrestling-electric">{wrestlerMentions.length}</div>
              <div className="text-sm text-muted-foreground">News Articles</div>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-400">{wrestler.sentimentScore}%</div>
              <div className="text-sm text-muted-foreground">Sentiment Score</div>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {wrestlerMentions.filter(item => 
                  new Date(item.pubDate) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">Last 24h</div>
            </div>
          </div>

          {/* Mentions List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Recent Mentions</span>
            </h3>
            
            {wrestlerMentions.length > 0 ? (
              <div className="space-y-3">
                {wrestlerMentions.slice(0, 10).map((mention, index) => (
                  <div key={index} className="p-4 bg-background border border-border/50 rounded-lg hover:bg-secondary/20 transition-colors">
                    <div className="flex items-start justify-between space-x-4">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground mb-2 line-clamp-2">
                          {mention.title}
                        </h4>
                        {mention.contentSnippet && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                            {mention.contentSnippet}
                          </p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(mention.pubDate)}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {mention.source}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(mention.link, '_blank')}
                        className="flex items-center space-x-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>Read</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No recent mentions found for {wrestler.wrestler_name}</p>
                <p className="text-sm">This wrestler may be using fallback data</p>
              </div>
            )}
          </div>

          {wrestlerMentions.length > 10 && (
            <div className="text-center text-sm text-muted-foreground">
              Showing 10 of {wrestlerMentions.length} mentions
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
