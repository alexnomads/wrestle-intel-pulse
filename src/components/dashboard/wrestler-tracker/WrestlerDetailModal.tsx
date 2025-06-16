
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { DataQualityIndicator } from '@/components/wrestler-intelligence/DataQualityIndicator';

// Import the new component parts
import { WrestlerModalHeader } from './modal/WrestlerModalHeader';
import { ChampionshipSection } from './modal/ChampionshipSection';
import { KeyMetricsGrid } from './modal/KeyMetricsGrid';
import { AdvancedAnalyticsSection } from './modal/AdvancedAnalyticsSection';
import { RecentNewsSection } from './modal/RecentNewsSection';
import { MentionSourcesSection } from './modal/MentionSourcesSection';
import { EvidenceSection } from './modal/EvidenceSection';

interface WrestlerDetailModalProps {
  wrestler: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WrestlerDetailModal = ({ wrestler, isOpen, onClose }: WrestlerDetailModalProps) => {
  if (!wrestler) return null;

  console.log('WrestlerDetailModal - full wrestler data:', wrestler);

  // Ensure we have the data in the right format
  const enhancedWrestler = {
    ...wrestler,
    // Make sure related news is accessible
    relatedNews: wrestler.relatedNews || wrestler.mention_sources || [],
    // Ensure mention_sources is available
    mention_sources: wrestler.mention_sources || wrestler.relatedNews || []
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6 sm:space-y-8">
          <WrestlerModalHeader wrestler={enhancedWrestler} />

          {/* Data Quality Indicator */}
          {enhancedWrestler.confidence_level && enhancedWrestler.data_sources && (
            <DataQualityIndicator
              confidenceLevel={enhancedWrestler.confidence_level}
              mentionCount={enhancedWrestler.mention_count || enhancedWrestler.totalMentions || 0}
              lastUpdated={new Date(enhancedWrestler.last_updated || Date.now())}
              dataSources={enhancedWrestler.data_sources}
            />
          )}

          <ChampionshipSection wrestler={enhancedWrestler} />

          <KeyMetricsGrid wrestler={enhancedWrestler} />

          <Separator />

          <AdvancedAnalyticsSection wrestler={enhancedWrestler} />

          <Separator />

          <RecentNewsSection wrestler={enhancedWrestler} />

          <MentionSourcesSection wrestler={enhancedWrestler} />

          <EvidenceSection wrestler={enhancedWrestler} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
