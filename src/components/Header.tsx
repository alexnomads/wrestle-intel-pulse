import { Search, Bell, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
export const Header = () => {
  return <header className="border-b border-border/50 bg-card/20 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-wrestling-electric to-wrestling-purple rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm text-yellow-300">WMG</span>
            </div>
            <span className="text-xl font-bold text-yellow-300">Wrestling Mind Games</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#" className="text-foreground hover:text-primary transition-colors">Dashboard</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Wrestlers</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Promotions</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Analytics</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Trends</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>;
};