
interface FederationComparisonProps {
  filteredAnalysis: any[];
  getPopularityScore: (wrestler: any) => number;
}

export const FederationComparison = ({ filteredAnalysis, getPopularityScore }: FederationComparisonProps) => {
  return (
    <div className="pt-4 border-t border-secondary/50">
      <h4 className="font-medium text-foreground mb-3">Federation Popularity Comparison</h4>
      <div className="grid grid-cols-3 gap-4">
        {['WWE', 'AEW', 'TNA'].map((fed) => {
          const fedWrestlers = filteredAnalysis.filter(w => 
            w.promotion.toLowerCase().includes(fed.toLowerCase())
          );
          const avgPopularity = fedWrestlers.length > 0 
            ? Math.round(fedWrestlers.reduce((sum, w) => sum + getPopularityScore(w), 0) / fedWrestlers.length)
            : 0;
          
          return (
            <div key={fed} className="text-center p-3 bg-secondary/20 rounded-lg">
              <div className="text-lg font-bold text-wrestling-electric">{avgPopularity}</div>
              <div className="text-sm text-muted-foreground">{fed} Avg Score</div>
              <div className="text-xs text-muted-foreground">{fedWrestlers.length} wrestlers</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
