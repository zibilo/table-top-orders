import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, DollarSign, ShoppingBag, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const StatsManagement = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*');
      
      const { data: menuData } = await supabase
        .from('menu_items')
        .select('*');
      
      if (ordersData) setOrders(ordersData);
      if (menuData) setMenuItems(menuData);
    };

    fetchStats();
  }, []);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((acc, order) => acc + Number(order.total_price), 0);
  const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const stats = [
    {
      title: "Commandes totales",
      value: totalOrders.toString(),
      icon: ShoppingBag,
      color: "text-primary"
    },
    {
      title: "Chiffre d'affaires",
      value: `${totalRevenue.toFixed(2)}€`,
      icon: DollarSign,
      color: "text-success"
    },
    {
      title: "Panier moyen",
      value: `${averageOrder.toFixed(2)}€`,
      icon: TrendingUp,
      color: "text-warning"
    },
    {
      title: "Plats au menu",
      value: menuItems.length.toString(),
      icon: Star,
      color: "text-secondary"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Statistiques 📊</h2>
        <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-4 bg-accent rounded-full ${stat.color}`}>
                <stat.icon className="w-8 h-8" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-8">
        <h3 className="text-xl font-bold mb-4">Plats au menu 🏆</h3>
        <div className="space-y-4">
          {menuItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucun plat au menu</p>
          ) : (
            menuItems.slice(0, 5).map((item, idx) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded">
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-primary">#{idx + 1}</span>
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{Number(item.price).toFixed(2)}€</p>
                  </div>
                </div>
                <span className="text-2xl">{item.emoji || '🍽️'}</span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
