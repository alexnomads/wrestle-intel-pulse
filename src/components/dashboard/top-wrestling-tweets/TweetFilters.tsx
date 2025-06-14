
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';

interface TweetFiltersProps {
  filterType: string;
  onFilterChange: (type: string) => void;
}

const TweetFilters: React.FC<TweetFiltersProps> = ({ filterType, onFilterChange }) => {
  const filterTypes = ['all', 'federation', 'wrestler', 'journalist', 'insider', 'legend'];

  return (
    <div className="flex items-center space-x-2 mt-4">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <div className="flex flex-wrap gap-2">
        {filterTypes.map(type => (
          <Badge
            key={type}
            variant={filterType === type ? "default" : "outline"}
            className="cursor-pointer capitalize"
            onClick={() => onFilterChange(type)}
          >
            {type}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TweetFilters;
