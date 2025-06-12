
import { Filter } from "lucide-react";
import { FilterType } from "./types";

interface FilterButtonsProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export const FilterButtons = ({ filter, onFilterChange }: FilterButtonsProps) => {
  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'positive', label: 'Positive' },
    { id: 'negative', label: 'Negative' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <Filter className="h-4 w-4 text-muted-foreground" />
      {filterOptions.map((filterOption) => (
        <button
          key={filterOption.id}
          onClick={() => onFilterChange(filterOption.id as FilterType)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            filter === filterOption.id
              ? 'bg-wrestling-electric text-white'
              : 'bg-secondary text-foreground hover:bg-secondary/80'
          }`}
        >
          {filterOption.label}
        </button>
      ))}
    </div>
  );
};
