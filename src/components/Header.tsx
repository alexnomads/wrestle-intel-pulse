
import { Button } from "@/components/ui/button";
import { Users, Calendar, Search, Database, Activity, TrendingUp, BarChart3, Zap } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'wrestler-intelligence', label: 'Wrestler Intel', icon: Users },
    { id: 'storyline-tracker', label: 'Storylines', icon: Activity },
    { id: 'industry-analytics', label: 'Industry', icon: TrendingUp },
    { id: 'rosters', label: 'Rosters', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'data', label: 'Data', icon: Database },
  ];

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-wrestling-electric" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-wrestling-electric to-wrestling-purple bg-clip-text text-transparent">
                Wrestling Intelligence
              </h1>
            </div>
          </div>
          
          <nav className="flex items-center space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(tab.id)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
