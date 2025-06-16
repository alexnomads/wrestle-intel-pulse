
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6 sm:space-y-8">
          <WrestlerModalHeader wrestler={wrestler} />

          {/* Data Quality Indicator */}
          {wrestler.confidence_level && wrestler.data_sources && (
            <DataQualityIndicator
              confidenceLevel={wrestler.confidence_level}
              mentionCount={wrestler.mention_count || 0}
              lastUpdated={new Date(wrestler.last_updated || Date.now())}
              dataSources={wrestler.data_sources}
            />
          )}

          <ChampionshipSection wrestler={wrestler} />

          <KeyMetricsGrid wrestler={wrestler} />

          <Separator />

          <AdvancedAnalyticsSection wrestler={wrestler} />

          <Separator />

          <RecentNewsSection wrestler={wrestler} />

          <MentionSourcesSection wrestler={wrestler} />

          <EvidenceSection wrestler={wrestler} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
