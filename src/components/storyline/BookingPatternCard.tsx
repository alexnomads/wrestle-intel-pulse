
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BookingPattern {
  promotion: string;
  pattern: string;
  frequency: number;
  effectiveness: number;
  examples: string[];
}

interface BookingPatternCardProps {
  pattern: BookingPattern;
}

export const BookingPatternCard = ({ pattern }: BookingPatternCardProps) => {
  return (
    <Card className="glass-card">
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
  );
};
