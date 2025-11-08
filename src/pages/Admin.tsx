import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, Table, BarChart3 } from "lucide-react";

const Admin = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b-2 border-primary/20 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <LayoutDashboard className="text-primary" />
            Administration
          </h1>
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
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Gestion des commandes</h2>
              <p className="text-muted-foreground">Les commandes seront affichées ici...</p>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="mt-8">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Gestion du menu</h2>
              <p className="text-muted-foreground">La gestion du menu sera disponible ici...</p>
            </Card>
          </TabsContent>

          <TabsContent value="tables" className="mt-8">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Gestion des tables</h2>
              <p className="text-muted-foreground">La gestion des tables sera disponible ici...</p>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="mt-8">
            <Card className="p-8">
              <h2 className="text-2xl font-bold mb-4">Statistiques</h2>
              <p className="text-muted-foreground">Les statistiques seront affichées ici...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
