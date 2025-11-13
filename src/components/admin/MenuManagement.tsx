import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CategoryDialog } from "./CategoryDialog";
import { CreateDishForm } from "./CreateDishForm";

export const MenuManagement = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    
    if (error) {
      console.error("Error fetching categories:", error);
      return;
    }
    setCategories(data || []);
  };

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from("menu_items")
      .select(`
        *,
        options:menu_item_options(
          id,
          name,
          option_choices:menu_item_option_choices(
            id,
            name,
            price
          )
        )
      `)
      .order("name");
    
    if (error) {
      console.error("Error fetching menu items:", error);
      return;
    }
    setMenuItems(data || []);
  };

  const handleDeleteItem = async (id: string) => {
    const { error } = await supabase
      .from("menu_items")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le plat",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Plat supprimé",
      description: "Le plat a été retiré du menu",
    });
    fetchMenuItems();
  };

  const filteredItems = menuItems.filter(item => item.category_id === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestion du Menu</h2>
          <p className="text-muted-foreground">Gérez les catégories et les plats</p>
        </div>
        <div className="flex gap-3">
          <CategoryDialog onSuccess={fetchCategories} />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus />
                Nouveau plat
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Créer un nouveau plat</DialogTitle>
              </DialogHeader>
              <CreateDishForm 
                categoryId={selectedCategory} 
                onSuccess={() => {
                  setIsDialogOpen(false);
                  fetchMenuItems();
                  toast({
                    title: "Plat créé ! 🎉",
                    description: "Le plat a été ajouté au menu",
                  });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {categories.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Aucune catégorie. Créez-en une pour commencer.</p>
          <CategoryDialog onSuccess={fetchCategories} />
        </Card>
      ) : (
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full h-auto gap-2 bg-muted/50 p-2" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 5)}, 1fr)` }}>
            {categories.map(category => (
              <TabsTrigger 
                key={category.id}
                value={category.id}
                className="flex flex-col gap-2 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="text-2xl">{category.name.split(' ')[0]}</span>
                <span className="text-sm">{category.name.split(' ').slice(1).join(' ')}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category.id} value={category.id} className="mt-6">
              <div className="grid gap-4">
                {filteredItems.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">Aucun plat dans cette catégorie</p>
                  </Card>
                ) : (
                  filteredItems.map(item => (
                    <MenuItemCard key={item.id} item={item} onDelete={handleDeleteItem} />
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

const MenuItemCard = ({ item, onDelete }: { item: any; onDelete: (id: string) => void }) => {
  return (
    <Card className="p-6">
      <div className="flex gap-6">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 bg-accent rounded-lg flex items-center justify-center text-5xl">
            {item.emoji || '🍽️'}
          </div>
        </div>

        <div className="flex-grow space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{item.name}</h3>
              <p className="text-muted-foreground">{item.description}</p>
              {!item.is_available && (
                <Badge variant="destructive" className="mt-2">Indisponible</Badge>
              )}
            </div>
            <Badge className="text-lg px-4 py-2 bg-secondary">
              {Number(item.price).toFixed(2)} €
            </Badge>
          </div>

          {item.options && item.options.length > 0 && (
            <div className="space-y-2">
              <p className="text-base font-semibold">Options :</p>
              <div className="grid grid-cols-2 gap-2">
                {item.options.map((option: any) => (
                  <div key={option.id} className="p-2 bg-muted/50 rounded text-sm">
                    {option.name}
                    {option.option_choices?.map((choice: any) => (
                      <div key={choice.id} className="ml-2 text-xs">
                        • {choice.name} {choice.price > 0 && `+${Number(choice.price).toFixed(2)}€`}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="gap-2" disabled>
              <Edit className="w-4 h-4" />
              Modifier
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="gap-2"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
