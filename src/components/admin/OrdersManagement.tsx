import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, AlertCircle, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";

export const OrdersManagement = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const { toast } = useToast();
  const { unreadCount } = useRealtimeNotifications();

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        tables (table_number),
        order_items (
          *,
          menu_items (name, price),
          order_item_options (
            *,
            option_choices (name, price)
          )
        )
      `)
      .order('created_at', { ascending: false });
    
    if (data) setOrders(data);
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to new orders
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleValidateOrder = async (orderId: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'validated' })
      .eq('id', orderId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de valider la commande",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Commande validée ✅",
      description: "La commande a été validée avec succès",
    });

    fetchOrders();
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const validatedOrders = orders.filter(o => o.status === 'validated');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestion des Commandes 📋</h2>
          <p className="text-muted-foreground">Suivez et validez les commandes en temps réel</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Badge className="text-lg px-4 py-2 bg-warning animate-pulse">
              <Volume2 className="mr-2" />
              {unreadCount} notification(s)
            </Badge>
          )}
          {pendingOrders.length > 0 && (
            <Badge className="text-lg px-4 py-2 bg-warning">
              {pendingOrders.length} commande(s) en attente
            </Badge>
          )}
        </div>
      </div>

      {/* Commandes en attente */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="text-warning" />
          Commandes en attente ({pendingOrders.length})
        </h3>
        
        {pendingOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Aucune commande en attente</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onValidate={handleValidateOrder}
              />
            ))}
          </div>
        )}
      </div>

      {/* Commandes validées */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Check className="text-success" />
          Commandes validées ({validatedOrders.length})
        </h3>
        
        {validatedOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Aucune commande validée</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {validatedOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const OrderCard = ({ 
  order, 
  onValidate 
}: { 
  order: any;
  onValidate?: (id: string) => void;
}) => {
  return (
    <Card className={`p-6 ${order.status === 'pending' ? 'border-warning border-2' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-2xl font-bold">Table {order.tables?.table_number}</h4>
          <p className="text-sm text-muted-foreground">
            {new Date(order.created_at).toLocaleTimeString('fr-FR')}
          </p>
        </div>
        <Badge className={
          order.status === 'pending' ? 'bg-warning' : 'bg-success'
        }>
          {order.status === 'pending' ? '⏳ En attente' : '✅ Validée'}
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        {order.order_items?.map((item: any) => {
          const optionsPrice = item.order_item_options?.reduce(
            (acc: number, opt: any) => acc + Number(opt.option_choices?.price || 0),
            0
          ) || 0;
          
          return (
            <div key={item.id} className="flex justify-between items-start p-3 bg-muted/50 rounded">
              <div className="flex-grow">
                <p className="font-semibold">
                  {item.quantity}x {item.menu_items?.name}
                </p>
                {item.order_item_options && item.order_item_options.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Options: {item.order_item_options.map((o: any) => o.option_choices?.name).join(', ')}
                  </p>
                )}
              </div>
              <span className="font-semibold">
                {((Number(item.price) + optionsPrice) * item.quantity).toFixed(2)}€
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <span className="text-2xl font-bold">Total: {Number(order.total_price).toFixed(2)}€</span>
        {order.status === 'pending' && onValidate && (
          <Button 
            size="lg" 
            onClick={() => onValidate(order.id)}
            className="gap-2"
          >
            <Check />
            Valider la commande
          </Button>
        )}
      </div>
    </Card>
  );
};
