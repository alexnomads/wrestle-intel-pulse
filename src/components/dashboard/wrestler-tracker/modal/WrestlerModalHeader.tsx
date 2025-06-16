
import React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Crown, Flame } from 'lucide-react';

interface WrestlerModalHeaderProps {
  wrestler: any;
}

export const WrestlerModalHeader = ({ wrestler }: WrestlerModalHeaderProps) => {
  const getPromotionColor = (promotion: string) => {
    const colors = {
      'WWE': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      'AEW': 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      'TNA': 'bg-red-500/20 text-red-300 border-red-500/40',
      'NJPW': 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    };
    return colors[promotion?.toUpperCase()] || 'bg-slate-500/20 text-slate-300 border-slate-500/40';
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-3 text-xl sm:text-2xl">
          <span className="font-bold">{wrestler.wrestler_name || wrestler.name}</span>
          {wrestler.is_champion && <Crown className="h-6 w-6 text-yellow-400" />}
          {wrestler.isOnFire && <Flame className="h-6 w-6 text-orange-500" />}
        </DialogTitle>
      </DialogHeader>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
        <Badge variant="secondary" className={`border ${getPromotionColor(wrestler.promotion)}`}>
          {wrestler.promotion}
        </Badge>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm text-emerald-400 font-medium">ENHANCED DATA</span>
        </div>
      </div>
    </>
  );
};
