import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Menu = () => {
  const { tableNumber } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b-2 border-primary/20 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ChevronLeft />
            Retour
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Table</p>
            <p className="text-2xl font-bold text-primary">{tableNumber}</p>
          </div>

          <Button variant="default" size="icon" className="relative">
            <ShoppingCart />
            <Badge className="absolute -top-2 -right-2 bg-secondary h-6 w-6 p-0 flex items-center justify-center">
              0
            </Badge>
          </Button>
        </div>
      </header>

      {/* Menu Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Notre Menu 🍴
        </h1>
        
        <div className="text-center text-muted-foreground py-20">
          <p className="text-xl">Le menu sera affiché ici...</p>
        </div>
      </main>
    </div>
  );
};

export default Menu;
