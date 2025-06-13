
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Newspaper, MessageSquare, Search, Filter } from 'lucide-react';
import { WrestlerMention } from '@/types/wrestlerAnalysis';
import { formatDistanceToNow } from 'date-fns';

interface DetailedMentionsModalProps {
  wrestler: {
    id: string;
    wrestler_name: string;
    promotion: string;
    totalMentions: number;
    mention_sources?: WrestlerMention[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export const DetailedMentionsModal = ({ wrestler, isOpen, onClose }: DetailedMentionsModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'news' | 'reddit'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'sentiment'>('recent');

  const mentions = wrestler.mention_sources || [];

  const filteredMentions = mentions
    .filter(mention => {
      const matchesSearch = mention.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           mention.content_snippet.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSource = sourceFilter === 'all' || mention.source_type === sourceFilter;
      return matchesSearch && matchesSource;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      return b.sentiment_score - a.sentiment_score;
    });

  const getSourceIcon = (sourceType: string) => {
    return sourceType === 'news' ? (
      <Newspaper className="h-4 w-4 text-blue-500" />
    ) : (
      <MessageSquare className="h-4 w-4 text-orange-500" />
    );
  };

  const getSentimentColor = (score: number) => {
    if (score > 0.6) return 'text-green-500';
    if (score < 0.4) return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <span className="text-xl">{wrestler.wrestler_name} Mention Sources</span>
            <Badge variant="secondary">{wrestler.promotion}</Badge>
            <Badge variant="outline" className="bg-wrestling-electric/10 text-wrestling-electric">
              {mentions.length} sources found
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex items-center space-x-4 py-4 border-b">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={sourceFilter} onValueChange={(value: 'all' | 'news' | 'reddit') => setSourceFilter(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="news">News Only</SelectItem>
              <SelectItem value="reddit">Reddit Only</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: 'recent' | 'sentiment') => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="sentiment">Sentiment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mentions List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {filteredMentions.length > 0 ? (
            filteredMentions.map((mention, index) => (
              <div key={index} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getSourceIcon(mention.source_type)}
                    <span className="font-medium text-sm">{mention.source_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(mention.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium ${getSentimentColor(mention.sentiment_score)}`}>
                      {Math.round(mention.sentiment_score * 100)}% sentiment
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(mention.url, '_blank')}
                      className="h-7 px-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <h4 className="font-medium mb-1 hover:text-wrestling-electric cursor-pointer">
                  {mention.title}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {mention.content_snippet}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No mentions found matching your filters</p>
              <p className="text-sm">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="border-t pt-4 text-sm text-muted-foreground">
          Showing {filteredMentions.length} of {mentions.length} mentions • 
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
