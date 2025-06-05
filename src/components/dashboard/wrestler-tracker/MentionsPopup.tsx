
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ExternalLink, Info } from "lucide-react";

interface MentionsPopupProps {
  wrestler: any;
  timePeriod: string;
}

export const MentionsPopup = ({ wrestler, timePeriod }: MentionsPopupProps) => (
  <Popover>
    <PopoverTrigger asChild>
      <button className="ml-1 w-4 h-4 bg-wrestling-electric rounded-full flex items-center justify-center hover:bg-wrestling-purple transition-colors shadow-md">
        <Info className="h-2 w-2 text-white" />
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-80 max-h-96 overflow-y-auto bg-white dark:bg-gray-900 border-2 border-wrestling-electric/20 shadow-xl z-50">
      <div className="space-y-3">
        <h4 className="font-semibold text-foreground border-b border-wrestling-electric/20 pb-2">Recent Mentions for {wrestler.wrestler_name}</h4>
        <div className="text-sm text-muted-foreground bg-wrestling-electric/10 p-2 rounded">
          {wrestler.totalMentions} mentions in the last {timePeriod} days
        </div>
        
        {wrestler.relatedNews && wrestler.relatedNews.length > 0 ? (
          <div className="space-y-2">
            {wrestler.relatedNews.slice(0, 8).map((news: any, index: number) => (
              <div key={index} className="border-l-2 border-wrestling-electric pl-3 py-1 hover:bg-wrestling-electric/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground mb-1 leading-tight">
                      {news.title.substring(0, 100)}{news.title.length > 100 ? '...' : ''}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <span className="bg-wrestling-electric/20 text-wrestling-electric px-1 py-0.5 rounded text-xs mr-1">
                        {news.source}
                      </span>
                      • {new Date(news.pubDate).toLocaleDateString()}
                    </div>
                  </div>
                  <a 
                    href={news.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="ml-2 text-wrestling-electric hover:text-wrestling-purple transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
            {wrestler.relatedNews.length > 8 && (
              <div className="text-xs text-muted-foreground text-center pt-2 border-t border-wrestling-electric/20">
                And {wrestler.relatedNews.length - 8} more articles...
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800 p-3 rounded">
            No detailed coverage links available
          </div>
        )}
      </div>
    </PopoverContent>
  </Popover>
);
