
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  return (
    <div className="relative">
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              placeholder="Search wrestlers, storylines, promotions... (e.g., 'AEW women's division last 6 months')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button className="h-12 px-6 bg-primary hover:bg-primary/80 text-primary-foreground">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
        
        {/* Quick Search Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            "Trending Now",
            "Contract Rumors", 
            "Title Changes",
            "Injury Reports",
            "Free Agents",
            "Hot Storylines"
          ].map((tag) => (
            <button
              key={tag}
              className="px-3 py-1 text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
