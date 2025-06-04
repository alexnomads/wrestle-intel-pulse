
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, TrendingDown, Users, Zap } from "lucide-react";

interface Feud {
  id: string;
  participants: string[];
  storyline: string;
  promotion: string;
  startDate: string;
  intensity: number;
  fanReception: number;
  status: 'building' | 'climax' | 'cooling' | 'concluded';
}

interface BookingPattern {
  promotion: string;
  pattern: string;
  frequency: number;
  effectiveness: number;
  examples: string[];
}

export const StorylineTracker = () => {
  const [selectedPromotion, setSelectedPromotion] = useState('all');

  // Mock data - in real implementation, this would come from analysis
  const activefeuds: Feud[] = [
    {
      id: '1',
      participants: ['CM Punk', 'Drew McIntyre'],
      storyline: 'Personal rivalry stemming from past conflicts',
      promotion: 'WWE',
      startDate: '2024-01-15',
      intensity: 8.5,
      fanReception: 9.2,
      status: 'building'
    },
    {
      id: '2',
      participants: ['Jon Moxley', 'Orange Cassidy'],
      storyline: 'Championship pursuit storyline',
      promotion: 'AEW',
      startDate: '2024-02-01',
      intensity: 7.8,
      fanReception: 8.5,
      status: 'climax'
    },
    {
      id: '3',
      participants: ['Oba Femi', 'Trick Williams'],
      storyline: 'Title chase in developmental',
      promotion: 'NXT',
      startDate: '2024-01-20',
      intensity: 7.5,
      fanReception: 8.0,
      status: 'building'
    }
  ];

  const bookingPatterns: BookingPattern[] = [
    {
      promotion: 'WWE',
      pattern: 'Celebrity Integration',
      frequency: 85,
      effectiveness: 6.5,
      examples: ['Bad Bunny matches', 'Logan Paul storylines']
    },
    {
      promotion: 'AEW',
      pattern: 'Long-term Storytelling',
      frequency: 78,
      effectiveness: 8.2,
      examples: ['Hangman Page arc', 'MJF character development']
    },
    {
      promotion: 'NXT',
      pattern: 'Tournament Structure',
      frequency: 65,
      effectiveness: 7.8,
      examples: ['Breakout Tournament', 'Heritage Cup']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'building': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'climax': return 'bg-wrestling-electric/20 text-wrestling-electric border-wrestling-electric/30';
      case 'cooling': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'concluded': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-secondary text-secondary-foreground border-border';
    }
  };

  const filteredfeuds = selectedPromotion === 'all' 
    ? activefeuds 
    : activefeuds.filter(feud => feud.promotion.toLowerCase() === selectedPromotion);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-foreground">Storyline & Narrative Tracker</h2>
        <div className="flex space-x-2">
          {['all', 'wwe', 'aew', 'nxt', 'tna'].map((promotion) => (
            <Button
              key={promotion}
              variant={selectedPromotion === promotion ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPromotion(promotion)}
              className="capitalize"
            >
              {promotion === 'all' ? 'All' : promotion.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="feuds" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="feuds">Active Feuds</TabsTrigger>
          <TabsTrigger value="booking">Booking Patterns</TabsTrigger>
          <TabsTrigger value="titles">Title Picture</TabsTrigger>
          <TabsTrigger value="rumors">Rumor Mill</TabsTrigger>
        </TabsList>

        <TabsContent value="feuds" className="space-y-6">
          <div className="grid gap-6">
            {filteredfeuds.map((feud) => (
              <Card key={feud.id} className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {feud.participants.join(' vs ')}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(feud.status)}>
                        {feud.status}
                      </Badge>
                      <Badge variant="outline">{feud.promotion}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{feud.storyline}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-wrestling-electric">{feud.intensity}</div>
                      <div className="text-sm text-muted-foreground">Intensity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{feud.fanReception}</div>
                      <div className="text-sm text-muted-foreground">Fan Reception</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">
                        {Math.floor((Date.now() - new Date(feud.startDate).getTime()) / (1000 * 60 * 60 * 24))}d
                      </div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Intensity Score</span>
                      <span>{feud.intensity}/10</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-wrestling-electric to-wrestling-purple transition-all duration-500"
                        style={{ width: `${feud.intensity * 10}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="booking" className="space-y-6">
          <div className="grid gap-6">
            {bookingPatterns.map((pattern, index) => (
              <Card key={index} className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pattern.pattern}</CardTitle>
                    <Badge variant="outline">{pattern.promotion}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{pattern.frequency}%</div>
                      <div className="text-sm text-muted-foreground">Frequency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">{pattern.effectiveness}</div>
                      <div className="text-sm text-muted-foreground">Effectiveness</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">Recent Examples:</h4>
                    <div className="flex flex-wrap gap-2">
                      {pattern.examples.map((example, exIndex) => (
                        <Badge key={exIndex} variant="secondary" className="text-xs">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Effectiveness Rating</span>
                      <span>{pattern.effectiveness}/10</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-wrestling-electric transition-all duration-500"
                        style={{ width: `${pattern.effectiveness * 10}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="titles" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-muted-foreground mb-4">Championship Scene Analysis</h3>
            <p className="text-muted-foreground">
              Track championship scenes, title changes, and booking decisions across all major promotions.
            </p>
            <Button className="mt-4" variant="outline">
              Coming Soon
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="rumors" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-muted-foreground mb-4">Rumor Mill Intelligence</h3>
            <p className="text-muted-foreground">
              Aggregate and verify wrestling news, rumors, and insider reports with reliability scoring.
            </p>
            <Button className="mt-4" variant="outline">
              Coming Soon
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
