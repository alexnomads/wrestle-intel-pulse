import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WrestlerCard } from "./WrestlerCard";
import { getWrestlersByPromotion, searchWrestlers, type Promotion } from "@/services/wrestlerService";

interface RosterTabsProps {
  searchQuery: string;
}

export const RosterTabs = ({ searchQuery }: RosterTabsProps) => {
  const [activePromotion, setActivePromotion] = useState<Promotion>("wwe");

  const promotions: { id: Promotion; name: string; color: string }[] = [
    { id: "wwe", name: "WWE", color: "bg-red-600" },
    { id: "aew", name: "AEW", color: "bg-yellow-500" },
    { id: "nxt", name: "NXT", color: "bg-purple-600" },
    { id: "tna", name: "TNA", color: "bg-blue-600" }
  ];

  const getFilteredWrestlers = () => {
    if (searchQuery.trim()) {
      return searchWrestlers(searchQuery).filter(({ promotion }) => promotion === activePromotion);
    }
    return getWrestlersByPromotion(activePromotion).map(wrestler => ({ 
      promotion: activePromotion, 
      wrestler 
    }));
  };

  const filteredWrestlers = getFilteredWrestlers();

  return (
    <div className="space-y-6">
      <Tabs value={activePromotion} onValueChange={(value) => setActivePromotion(value as Promotion)}>
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
                  {filteredWrestlers.length} wrestler{filteredWrestlers.length !== 1 ? 's' : ''}
                </div>
              </div>

              {filteredWrestlers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredWrestlers.map(({ wrestler }) => (
                    <WrestlerCard
                      key={wrestler.id}
                      name={wrestler.name}
                      promotion={promotion.name}
                      status={wrestler.status}
                      sentiment="--"
                      mentions="--"
                      trending="stable"
                      image={wrestler.image}
                      championships={wrestler.championships}
                      mentionSources={{ news: 0, reddit: 0 }}
                    />
                  ))}
                </div>
              ) : (
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
