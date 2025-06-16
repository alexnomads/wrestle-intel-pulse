
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { SourceLink } from '@/components/mentions/SourceLink';

interface MentionSourcesSectionProps {
  wrestler: any;
}

export const MentionSourcesSection = ({ wrestler }: MentionSourcesSectionProps) => {
  if (!wrestler.mention_sources || wrestler.mention_sources.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Mention Sources</h3>
        <Badge variant="secondary">
          {wrestler.mention_sources.length} sources
        </Badge>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {wrestler.mention_sources.map((source: any, index: number) => (
          <div key={index} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border/30">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{source.title}</div>
              <div className="text-xs text-muted-foreground">{source.source_name}</div>
            </div>
            <SourceLink
              url={source.url}
              title={source.title}
              sourceType={source.source_type}
              sourceName={source.source_name}
              compact
            />
          </div>
        ))}
      </div>
    </div>
  );
};
