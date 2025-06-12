
import { Calendar, TrendingUp, Users } from "lucide-react";
import { ViewPeriod } from "./types";

interface PeriodToggleProps {
  viewPeriod: ViewPeriod;
  onPeriodChange: (period: ViewPeriod) => void;
}

export const PeriodToggle = ({ viewPeriod, onPeriodChange }: PeriodToggleProps) => {
  const periodOptions = [
    { id: 'daily', label: 'Daily', icon: Calendar },
    { id: 'weekly', label: 'Weekly', icon: TrendingUp },
    { id: 'monthly', label: 'Monthly', icon: Users }
  ];

  return (
    <div className="flex space-x-2">
      {periodOptions.map((period) => {
        const Icon = period.icon;
        return (
          <button
            key={period.id}
            onClick={() => onPeriodChange(period.id as ViewPeriod)}
            className={`flex items-center space-x-1 px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewPeriod === period.id
                ? 'bg-wrestling-electric text-white'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            <Icon className="h-3 w-3" />
            <span>{period.label}</span>
          </button>
        );
      })}
    </div>
  );
};
