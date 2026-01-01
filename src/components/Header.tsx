import { Car, Bike } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <div className="relative flex items-center gap-1 p-2 rounded-xl bg-primary/10">
                <Car className="w-6 h-6 text-primary" />
                <Bike className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                <span className="gradient-text">Auto</span>
                <span className="text-foreground">Analizė</span>
              </h1>
              <p className="text-xs text-muted-foreground">AI pirkimo patarėjas</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Kaip veikia
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Kainodara
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              DUK
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
