import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { CartItem } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface CartSheetProps {
  cartItems: CartItem[];
  totalPrice: number;
  totalItems: number;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  tableNumber: string;
}

export const CartSheet = ({
  cartItems,
  totalPrice,
  totalItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  tableNumber,
}: CartSheetProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmitOrder = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des articles avant de commander",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get table ID
      const { data: tableData, error: tableError } = await supabase
        .from("tables")
        .select("id")
        .eq("table_number", parseInt(tableNumber))
        .single();

      if (tableError || !tableData) {
        throw new Error("Table non trouvée");
      }

      // Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          table_id: tableData.id,
          total_price: totalPrice,
          status: "pending",
        })
        .select()
        .single();

      if (orderError || !orderData) {
        throw new Error("Erreur lors de la création de la commande");
      }

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: orderData.id,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        throw new Error("Erreur lors de l'ajout des articles");
      }

      toast({
        title: "Commande passée !",
        description: "Votre commande a été envoyée à la cuisine",
      });

      clearCart();
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="default" size="icon" className="relative">
          <ShoppingCart />
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-secondary h-6 w-6 p-0 flex items-center justify-center">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Mon Panier</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full pt-6">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Votre panier est vide</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-auto space-y-4 pr-2">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center text-3xl">
                        {item.emoji || "🍽️"}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {Number(item.price).toFixed(2)} €
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-auto text-destructive"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{totalPrice.toFixed(2)} €</span>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Envoi en cours..." : "Commander"}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
