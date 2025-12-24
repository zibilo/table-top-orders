import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import RestaurantDashboard from "@/components/dashboards/RestaurantDashboard";
import BeverageDepotDashboard from "@/components/dashboards/BeverageDepotDashboard";
import GroceryStoreDashboard from "@/components/dashboards/GroceryStoreDashboard";
import type { Database } from "@/integrations/supabase/types";

type EstablishmentType = Database["public"]["Enums"]["establishment_type"];

interface Establishment {
  id: string;
  name: string;
  type: EstablishmentType;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("establishments")
        .select("id, name, type")
        .eq("owner_id", session.user.id)
        .single();

      if (error || !data) {
        toast({
          title: "Erreur",
          description: "Impossible de charger votre établissement",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      setEstablishment(data);
      setIsLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!establishment) return null;

  const renderDashboard = () => {
    switch (establishment.type) {
      case "restaurant":
        return <RestaurantDashboard establishmentId={establishment.id} />;
      case "beverage_depot":
        return <BeverageDepotDashboard establishmentId={establishment.id} />;
      case "grocery_store":
        return <GroceryStoreDashboard establishmentId={establishment.id} />;
      default:
        return <div>Type d'établissement inconnu</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{establishment.name}</h1>
            <p className="text-sm text-muted-foreground capitalize">
              {establishment.type === "restaurant" && "Restaurant"}
              {establishment.type === "beverage_depot" && "Dépôt de Boissons"}
              {establishment.type === "grocery_store" && "Alimentation"}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        {renderDashboard()}
      </main>
    </div>
  );
};

export default Dashboard;
