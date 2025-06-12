
import React from 'react';

interface WrestlerStatsGridProps {
  wrestlers: any[];
}

export const WrestlerStatsGrid = ({ wrestlers }: WrestlerStatsGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <div className="text-center p-4 bg-secondary/30 rounded-lg">
        <div className="text-2xl font-bold text-wrestling-electric">
          {wrestlers.length}
        </div>
        <div className="text-sm text-muted-foreground">Active Performers</div>
      </div>
      
      <div className="text-center p-4 bg-secondary/30 rounded-lg">
        <div className="text-2xl font-bold text-green-500">
          {wrestlers.filter(w => w.change24h > 0).length}
        </div>
        <div className="text-sm text-muted-foreground">Rising Stars</div>
      </div>
      
      <div className="text-center p-4 bg-secondary/30 rounded-lg">
        <div className="text-2xl font-bold text-red-500">
          {wrestlers.filter(w => w.change24h < 0).length}
        </div>
        <div className="text-sm text-muted-foreground">Declining</div>
      </div>
      
      <div className="text-center p-4 bg-secondary/30 rounded-lg">
        <div className="text-2xl font-bold text-orange-500">
          {wrestlers.filter(w => w.isOnFire).length}
        </div>
        <div className="text-sm text-muted-foreground">Hot Topics</div>
      </div>
    </div>
  );
};
