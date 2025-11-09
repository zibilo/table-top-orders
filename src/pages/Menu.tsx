import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Menu = () => {
  const { tableNumber } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('created_at');
      
      const { data: itemsData } = await supabase
        .from('menu_items')
        .select('*')
        .eq('is_available', true)
        .order('created_at');
      
      if (categoriesData) {
        setCategories(categoriesData);
        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id);
        }
      }
      if (itemsData) setMenuItems(itemsData);
    };

    fetchData();
  }, []);

  const filteredItems = menuItems.filter(item => item.category_id === selectedCategory);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b-2 border-primary/20 shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ChevronLeft />
            Retour
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Table</p>
            <p className="text-2xl font-bold text-primary">{tableNumber}</p>
          </div>

          <Button variant="default" size="icon" className="relative">
            <ShoppingCart />
            <Badge className="absolute -top-2 -right-2 bg-secondary h-6 w-6 p-0 flex items-center justify-center">
              0
            </Badge>
          </Button>
        </div>
      </header>

      {/* Menu Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Notre Menu 🍴
        </h1>
        
        {categories.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            <p className="text-xl">Le menu n'est pas encore disponible...</p>
          </div>
        ) : (
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full h-auto gap-2 bg-muted/50 p-2 mb-8" style={{ gridTemplateColumns: `repeat(${Math.min(categories.length, 5)}, 1fr)` }}>
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
              <TabsContent key={category.id} value={category.id}>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredItems.length === 0 ? (
                    <div className="col-span-full text-center text-muted-foreground py-10">
                      <p>Aucun plat disponible dans cette catégorie</p>
                    </div>
                  ) : (
                    filteredItems.map(item => (
                      <Card key={item.id} className="p-4 hover:shadow-lg transition-shadow">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-accent rounded-lg flex items-center justify-center text-4xl">
                              {item.emoji || '🍽️'}
                            </div>
                          </div>
                          <div className="flex-grow">
                            <h3 className="text-lg font-bold">{item.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                            <Badge className="mt-2 bg-secondary">
                              {Number(item.price).toFixed(2)} €
                            </Badge>
                          </div>
                        </div>
                        <Button className="w-full mt-4" size="sm">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Ajouter
                        </Button>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Menu;
