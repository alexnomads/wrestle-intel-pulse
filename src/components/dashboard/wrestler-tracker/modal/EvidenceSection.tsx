
import React from 'react';

interface EvidenceSectionProps {
  wrestler: any;
}

export const EvidenceSection = ({ wrestler }: EvidenceSectionProps) => {
  if (!wrestler.evidence) return null;

  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
      <div className="text-sm text-muted-foreground mb-1">Analysis Evidence</div>
      <div className="text-sm">{wrestler.evidence}</div>
    </div>
  );
};
