import { BarChart3, Users, Calendar, Search, Database } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  return (
    <header className="bg-secondary border-b border-border h-16 flex items-center justify-between px-6">
      <div className="font-bold text-xl">Wrestling Stats</div>

      <nav className="hidden md:flex items-center space-x-6">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'rosters', label: 'Rosters', icon: Users },
          { id: 'events', label: 'Events', icon: Calendar },
          { id: 'search', label: 'Search', icon: Search },
          { id: 'data', label: 'Data', icon: Database },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              activeTab === item.id
                ? 'bg-wrestling-electric text-black'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <item.icon className="h-4 w-4" />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="md:hidden">
        {/* Mobile Menu (Example) */}
        <button className="text-muted-foreground hover:text-foreground">
          Menu
        </button>
      </div>
    </header>
  );
};
