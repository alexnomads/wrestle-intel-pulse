
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContractStatusCardProps {
  contract: {
    wrestlerName: string;
    promotion: string;
    status: string;
    expirationDate: string;
    marketValue: string;
    leverage: string;
  };
}

export const ContractStatusCard = ({ contract }: ContractStatusCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'expiring':
        return 'bg-yellow-500';
      case 'expired':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getMarketValueColor = (value: string) => {
    switch (value.toLowerCase()) {
      case 'high':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-wrestling-electric/20 to-wrestling-purple/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {contract.wrestlerName.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{contract.wrestlerName}</h3>
              <p className="text-sm text-muted-foreground">{contract.promotion}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <Badge className={getStatusColor(contract.status)}>
                {contract.status}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">
                Expires: {contract.expirationDate}
              </div>
              <div className={`text-sm font-medium ${getMarketValueColor(contract.marketValue)}`}>
                Market Value: {contract.marketValue}
              </div>
              <div className="text-xs text-muted-foreground">
                Leverage: {contract.leverage}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
