
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Filter, Search } from 'lucide-react';

interface DashboardFiltersEnhancedProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedPromotion: string;
  setSelectedPromotion: (value: string) => void;
  minMentions: string;
  setMinMentions: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  wrestlers: any[];
}

export const DashboardFiltersEnhanced = ({
  searchTerm,
  setSearchTerm,
  selectedPromotion,
  setSelectedPromotion,
  sortBy,
  setSortBy,
  wrestlers
}: DashboardFiltersEnhancedProps) => {
  const availablePromotions = [...new Set(wrestlers.map(w => w.promotions?.name).filter(Boolean))];

  return (
    <Card className="glass-card border-slate-700/50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground whitespace-nowrap">
            <Filter className="h-4 w-4" />
            <span>Filters:</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search wrestlers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Select value={selectedPromotion} onValueChange={setSelectedPromotion}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Promotion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {availablePromotions.map(promotion => (
                    <SelectItem key={promotion} value={promotion.toLowerCase()}>
                      {promotion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mentions">Mentions</SelectItem>
                  <SelectItem value="push">Push Score</SelectItem>
                  <SelectItem value="sentiment">Sentiment</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-emerald-600 whitespace-nowrap">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="font-medium">{wrestlers.length} wrestlers</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
