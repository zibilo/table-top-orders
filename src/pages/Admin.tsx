import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Table, BarChart3, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MenuManagement } from "@/components/admin/MenuManagement";
import { OrdersManagement } from "@/components/admin/OrdersManagement";
import { TablesManagement } from "@/components/admin/TablesManagement";
import { StatsManagement } from "@/components/admin/StatsManagement";
import { NotificationCenter } from "@/components/admin/NotificationCenter";

const Admin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier l'authentification
    const isAuth = sessionStorage.getItem("adminAuth");
    if (!isAuth) {
      navigate("/admin/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b-2 border-primary/20 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <LayoutDashboard className="text-primary" />
              Administration
            </h1>
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <Button variant="outline" onClick={handleLogout} className="gap-2">
                <LogOut className="w-4 h-4" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto gap-2 bg-muted/50 p-2">
            <TabsTrigger 
              value="orders" 
              className="flex flex-col gap-2 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <ShoppingBag className="w-6 h-6" />
              <span>Commandes</span>
            </TabsTrigger>
            <TabsTrigger 
              value="menu" 
              className="flex flex-col gap-2 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <UtensilsCrossed className="w-6 h-6" />
              <span>Menu</span>
            </TabsTrigger>
            <TabsTrigger 
              value="tables" 
              className="flex flex-col gap-2 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Table className="w-6 h-6" />
              <span>Tables</span>
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="flex flex-col gap-2 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BarChart3 className="w-6 h-6" />
              <span>Statistiques</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-8">
            <OrdersManagement />
          </TabsContent>

          <TabsContent value="menu" className="mt-8">
            <MenuManagement />
          </TabsContent>

          <TabsContent value="tables" className="mt-8">
            <TablesManagement />
          </TabsContent>

          <TabsContent value="stats" className="mt-8">
            <StatsManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
