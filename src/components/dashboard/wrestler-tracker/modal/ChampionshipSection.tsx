
import React from 'react';

interface ChampionshipSectionProps {
  wrestler: any;
}

export const ChampionshipSection = ({ wrestler }: ChampionshipSectionProps) => {
  if (!wrestler.championship_title) return null;

  return (
    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
      <div className="text-sm text-yellow-300 font-semibold">Current Champion</div>
      <div className="text-yellow-400 font-bold text-lg">{wrestler.championship_title}</div>
    </div>
  );
};
