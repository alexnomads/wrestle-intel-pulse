
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

interface StorylineFiltersProps {
  selectedPromotion: string;
  onPromotionChange: (value: string) => void;
  intensityFilter: string;
  onIntensityFilterChange: (value: string) => void;
  timeframe: string;
  onTimeframeChange: (value: string) => void;
  filteredStorylinesCount: number;
}

export const StorylineFilters = ({
  selectedPromotion,
  onPromotionChange,
  intensityFilter,
  onIntensityFilterChange,
  timeframe,
  onTimeframeChange,
  filteredStorylinesCount
}: StorylineFiltersProps) => {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filters & Options</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Promotion</label>
            <Select value={selectedPromotion} onValueChange={onPromotionChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Promotions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Promotions</SelectItem>
                <SelectItem value="wwe">WWE</SelectItem>
                <SelectItem value="aew">AEW</SelectItem>
                <SelectItem value="tna">TNA</SelectItem>
                <SelectItem value="njpw">NJPW</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Intensity Level</label>
            <Select value={intensityFilter} onValueChange={onIntensityFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="high">High (7+ intensity)</SelectItem>
                <SelectItem value="medium">Medium (4-7 intensity)</SelectItem>
                <SelectItem value="low">Low (Under 4)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Timeframe</label>
            <Select value={timeframe} onValueChange={onTimeframeChange}>
              <SelectTrigger>
                <SelectValue placeholder="7 Days" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {filteredStorylinesCount} storylines
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
