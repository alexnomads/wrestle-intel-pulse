
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WrestlerCard } from "./WrestlerCard";
import { useWrestlersByPromotion, useWrestlerSearch } from "@/hooks/useSupabaseWrestlers";
import { Crown } from "lucide-react";

interface RosterTabsProps {
  searchQuery: string;
}

export const RosterTabs = ({ searchQuery }: RosterTabsProps) => {
  const [activePromotion, setActivePromotion] = useState("WWE");

  const promotions = [
    { id: "WWE", name: "WWE", color: "bg-red-600" },
    { id: "AEW", name: "AEW", color: "bg-yellow-500" },
    { id: "NXT", name: "NXT", color: "bg-purple-600" },
    { id: "TNA", name: "TNA", color: "bg-blue-600" }
  ];

  // Use search query if provided, otherwise get wrestlers by promotion
  const { data: searchResults = [] } = useWrestlerSearch(searchQuery);
  const { data: promotionWrestlers = [] } = useWrestlersByPromotion(activePromotion);

  // Filter wrestlers properly - only show wrestlers that belong to the current promotion
  const getFilteredWrestlers = () => {
    let wrestlers = searchQuery.trim() ? searchResults : promotionWrestlers;
    
    // Filter by promotion and status (Active or Injured)
    wrestlers = wrestlers.filter(wrestler => {
      const belongsToPromotion = wrestler.promotions?.name === activePromotion;
      const isActiveOrInjured = wrestler.status?.toLowerCase() === 'active' || wrestler.status?.toLowerCase() === 'injured';
      return belongsToPromotion && isActiveOrInjured;
    });

    // Remove duplicates based on wrestler name
    const uniqueWrestlers = wrestlers.filter((wrestler, index, self) => 
      index === self.findIndex(w => w.name.toLowerCase() === wrestler.name.toLowerCase())
    );

    return uniqueWrestlers;
  };

  const filteredWrestlers = getFilteredWrestlers();

  // Separate champions and regular wrestlers - champions are those with is_champion = true
  const champions = filteredWrestlers.filter(wrestler => wrestler.is_champion === true);
  const regularWrestlers = filteredWrestlers.filter(wrestler => wrestler.is_champion !== true);

  // Sort champions first, then regular wrestlers
  const sortedWrestlers = [...champions, ...regularWrestlers];

  console.log(`${activePromotion} - Total wrestlers: ${filteredWrestlers.length}, Champions: ${champions.length}, Regular: ${regularWrestlers.length}`);

  return (
    <div className="space-y-6">
      <Tabs value={activePromotion} onValueChange={setActivePromotion}>
        <TabsList className="grid w-full grid-cols-4">
          {promotions.map((promotion) => (
            <TabsTrigger key={promotion.id} value={promotion.id} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${promotion.color}`} />
              <span>{promotion.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {promotions.map((promotion) => (
          <TabsContent key={promotion.id} value={promotion.id} className="mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-foreground">
                  {promotion.name} Roster
                </h3>
                <div className="text-sm text-muted-foreground">
                  {sortedWrestlers.length} wrestler{sortedWrestlers.length !== 1 ? 's' : ''}
                  {champions.length > 0 && (
                    <span className="ml-2 text-wrestling-gold">
                      • {champions.length} champion{champions.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {/* Champions Section */}
              {champions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-wrestling-gold" />
                    <h4 className="text-lg font-semibold text-wrestling-gold">Current Champions</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {champions.map((wrestler) => (
                      <WrestlerCard
                        key={`champion-${wrestler.id}-${wrestler.name}`}
                        name={wrestler.name}
                        promotion={wrestler.promotions?.name || promotion.name}
                        status={wrestler.status}
                        sentiment="--"
                        mentions="--"
                        trending="stable"
                        image={wrestler.image_url || undefined}
                        championships={wrestler.is_champion ? ["Champion"] : []}
                        championshipTitle={wrestler.championship_title}
                        mentionSources={{ news: 0, reddit: 0 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Wrestlers Section */}
              {regularWrestlers.length > 0 && (
                <div className="space-y-4">
                  {champions.length > 0 && (
                    <h4 className="text-lg font-semibold text-foreground">Roster</h4>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularWrestlers.map((wrestler) => (
                      <WrestlerCard
                        key={`wrestler-${wrestler.id}-${wrestler.name}`}
                        name={wrestler.name}
                        promotion={wrestler.promotions?.name || promotion.name}
                        status={wrestler.status}
                        sentiment="--"
                        mentions="--"
                        trending="stable"
                        image={wrestler.image_url || undefined}
                        championships={wrestler.is_champion ? ["Champion"] : []}
                        championshipTitle={wrestler.championship_title}
                        mentionSources={{ news: 0, reddit: 0 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {sortedWrestlers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  {searchQuery ? `No wrestlers found matching "${searchQuery}"` : "No wrestlers found"}
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
