
import { ViewPeriod } from "./types";

interface PeriodSummaryProps {
  viewPeriod: ViewPeriod;
}

export const PeriodSummary = ({ viewPeriod }: PeriodSummaryProps) => {
  if (viewPeriod === 'daily') return null;

  return (
    <div className="pt-4 border-t border-secondary/50">
      <h4 className="font-medium text-foreground mb-3">
        {viewPeriod === 'weekly' ? 'This Week' : 'This Month'} in Wrestling Communities
      </h4>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-secondary/20 rounded-lg">
          <div className="text-lg font-bold text-green-500">
            {viewPeriod === 'weekly' ? '↑ 23%' : '↑ 67%'}
          </div>
          <div className="text-sm text-muted-foreground">Community Engagement Growth</div>
        </div>
        <div className="p-3 bg-secondary/20 rounded-lg">
          <div className="text-lg font-bold text-blue-500">
            {viewPeriod === 'weekly' ? '156' : '420'}
          </div>
          <div className="text-sm text-muted-foreground">Hot Topics Discussed</div>
        </div>
      </div>
    </div>
  );
};
