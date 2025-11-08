import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UtensilsCrossed, ArrowRight, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TABLES } from "@/data/mockdata";

const Index = () => {
  const [tableNumber, setTableNumber] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tableNumber.trim()) {
      setError("Veuillez entrer un numéro de table");
      return;
    }

    const tableNum = parseInt(tableNumber);
    if (isNaN(tableNum) || tableNum < 1) {
      setError("Numéro de table invalide");
      return;
    }

    // Vérifier si la table existe et est active
    const table = TABLES.find(t => t.number === tableNum);
    if (!table || !table.isActive) {
      setError("Cette table n'est pas disponible");
      return;
    }

    // Rediriger vers le menu
    navigate(`/menu/${tableNumber}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-8 shadow-lg">
        {/* Logo et titre */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary rounded-full p-6 shadow-md">
              <UtensilsCrossed className="w-16 h-16 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Bienvenue ! 🍽️
          </h1>
          <p className="text-xl text-muted-foreground">
            Entrez votre numéro de table pour commander
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input
              type="number"
              placeholder="Numéro de table"
              value={tableNumber}
              onChange={(e) => {
                setTableNumber(e.target.value);
                setError("");
              }}
              className="h-16 text-2xl text-center font-bold border-2 focus:border-primary"
              min="1"
            />
            {error && (
              <p className="text-destructive text-sm text-center font-medium">
                {error}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full"
            size="lg"
          >
            Voir le menu
            <ArrowRight className="ml-2" />
          </Button>
        </form>

        {/* Info supplémentaire */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Besoin d'aide ? Appelez un serveur 👋
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/admin/login")}
            className="gap-2 text-xs"
          >
            <Lock className="w-3 h-3" />
            Accès administration
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Index;
