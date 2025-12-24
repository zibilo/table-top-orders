import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, UtensilsCrossed, LayoutGrid, BarChart3 } from "lucide-react";
import { OrdersManagement } from "@/components/admin/OrdersManagement";
import { MenuManagement } from "@/components/admin/MenuManagement";
import { TablesManagement } from "@/components/admin/TablesManagement";
import { StatsManagement } from "@/components/admin/StatsManagement";

interface RestaurantDashboardProps {
  establishmentId: string;
}

const RestaurantDashboard = ({ establishmentId }: RestaurantDashboardProps) => {
  return (
    <Tabs defaultValue="orders" className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-6">
        <TabsTrigger value="orders" className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          <span className="hidden sm:inline">Commandes</span>
        </TabsTrigger>
        <TabsTrigger value="menu" className="flex items-center gap-2">
          <UtensilsCrossed className="h-4 w-4" />
          <span className="hidden sm:inline">Menu</span>
        </TabsTrigger>
        <TabsTrigger value="tables" className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4" />
          <span className="hidden sm:inline">Tables</span>
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Statistiques</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="orders">
        <OrdersManagement />
      </TabsContent>
      <TabsContent value="menu">
        <MenuManagement />
      </TabsContent>
      <TabsContent value="tables">
        <TablesManagement />
      </TabsContent>
      <TabsContent value="stats">
        <StatsManagement />
      </TabsContent>
    </Tabs>
  );
};

export default RestaurantDashboard;
