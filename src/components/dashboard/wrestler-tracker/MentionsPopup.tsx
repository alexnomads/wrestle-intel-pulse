
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ExternalLink, Info } from "lucide-react";

interface MentionsPopupProps {
  wrestler: any;
  timePeriod: string;
}

export const MentionsPopup = ({ wrestler, timePeriod }: MentionsPopupProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <button className="ml-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
        <Info className="h-2 w-2 text-white" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground">Recent Mentions for {wrestler.wrestler_name}</h4>
        <div className="text-sm text-muted-foreground">
          {wrestler.totalMentions} mentions in the last {timePeriod} days
        </div>
        
        {wrestler.relatedNews && wrestler.relatedNews.length > 0 ? (
          <div className="space-y-2">
            {wrestler.relatedNews.slice(0, 8).map((news: any, index: number) => (
              <div key={index} className="border-l-2 border-blue-400 pl-3 py-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground mb-1 leading-tight">
                      {news.title.substring(0, 100)}{news.title.length > 100 ? '...' : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {news.source} • {new Date(news.pubDate).toLocaleDateString()}
                    </div>
                  </div>
                  <a 
                    href={news.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-500 hover:text-blue-400 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
            {wrestler.relatedNews.length > 8 && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                And {wrestler.relatedNews.length - 8} more articles...
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No detailed coverage links available
          </div>
        )}
      </div>
    </PopoverContent>
  </Popover>
);
