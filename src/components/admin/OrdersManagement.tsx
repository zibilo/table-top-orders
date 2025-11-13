import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

export const OrdersManagement = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("pending");
  const { toast } = useToast();
  useRealtimeNotifications();

  useEffect(() => {
    fetchOrders();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        tables (table_number),
        order_items (
          id,
          quantity,
          menu_items (name, price)
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      return;
    }
    setOrders(data || []);
  };

  const updateOrderStatus = async (orderId: string, status: "cancelled" | "completed" | "pending" | "validated") => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la commande",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Statut mis à jour",
      description: `La commande a été marquée comme ${status === "completed" ? "terminée" : "annulée"}`,
    });
    fetchOrders();
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "all") return true;
    return order.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestion des Commandes</h2>
          <p className="text-muted-foreground">Suivez et gérez les commandes en temps réel</p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList className="grid w-full grid-cols-3 bg-muted/50">
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            En attente
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Terminées
          </TabsTrigger>
          <TabsTrigger value="all">Toutes</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6 space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Aucune commande {filter !== "all" && `${filter === "pending" ? "en attente" : "terminée"}`}</p>
            </Card>
          ) : (
            filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onUpdateStatus={updateOrderStatus}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const OrderCard = ({ order, onUpdateStatus }: { order: any; onUpdateStatus: (id: string, status: "cancelled" | "completed" | "pending" | "validated") => void }) => {
  const total = order.order_items?.reduce((sum: number, item: any) => {
    return sum + (Number(item.menu_items?.price || 0) * item.quantity);
  }, 0) || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="w-3 h-3" />En attente</Badge>;
      case "completed":
        return <Badge className="gap-1 bg-green-500"><CheckCircle2 className="w-3 h-3" />Terminée</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" />Annulée</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">Table {order.tables?.table_number}</h3>
            <p className="text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleString("fr-FR")}
            </p>
          </div>
          {getStatusBadge(order.status)}
        </div>

        <div className="space-y-2">
          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.quantity}x {item.menu_items?.name}
              </span>
              <span className="font-semibold">
                {(Number(item.menu_items?.price || 0) * item.quantity).toFixed(2)} €
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t flex justify-between items-center">
          <span className="text-xl font-bold">Total: {total.toFixed(2)} €</span>
          {order.status === "pending" && (
            <div className="flex gap-2">
              <Button
                onClick={() => onUpdateStatus(order.id, "completed")}
                className="gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Terminer
              </Button>
              <Button
                onClick={() => onUpdateStatus(order.id, "cancelled")}
                variant="destructive"
                className="gap-2"
              >
                <XCircle className="w-4 h-4" />
                Annuler
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
