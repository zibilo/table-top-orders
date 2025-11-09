import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CATEGORIES, MENU_ITEMS, MenuItem } from "@/data/mockdata";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateDishForm } from "./CreateDishForm";

interface DishOption {
  id: string;
  name: string;
  price: number;
}

export const MenuManagement = () => {
  const [menuItems, setMenuItems] = useState(MENU_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredItems = menuItems.filter(item => item.categoryId === selectedCategory);
  
  const playBeep = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestion du Menu 🍽️</h2>
          <p className="text-muted-foreground">Gérez les catégories, plats et options</p>
        </div>
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
              onSuccess={(newItem) => {
                setMenuItems([...menuItems, newItem]);
                setIsDialogOpen(false);
                playBeep();
                toast({
                  title: "Plat créé ! 🎉",
                  description: `${newItem.name} a été ajouté au menu`,
                });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue={CATEGORIES[0].id} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5 h-auto gap-2 bg-muted/50 p-2">
          {CATEGORIES.map(category => (
            <TabsTrigger 
              key={category.id}
              value={category.id}
              className="flex flex-col gap-2 py-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <span className="text-2xl">{category.name.split(' ')[0]}</span>
              <span className="text-sm">{category.name.split(' ')[1]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map(category => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="grid gap-4">
              {filteredItems.map(item => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

const MenuItemCard = ({ item }: { item: MenuItem }) => {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Card className="p-6">
      <div className="flex gap-6">
        {/* Image */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 bg-accent rounded-lg flex items-center justify-center text-5xl">
            {item.image}
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-grow space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{item.name}</h3>
              <p className="text-muted-foreground">{item.description}</p>
            </div>
            <Badge className="text-lg px-4 py-2 bg-secondary">
              {item.price.toFixed(2)} €
            </Badge>
          </div>

          {/* Options */}
          {item.options && item.options.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base font-semibold">Options personnalisables :</Label>
              <div className="grid grid-cols-2 gap-3">
                {item.options.map(option => (
                  <div key={option.id} className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                    <Checkbox id={`${item.id}-${option.id}`} defaultChecked />
                    <label
                      htmlFor={`${item.id}-${option.id}`}
                      className="text-sm font-medium leading-none cursor-pointer flex-grow"
                    >
                      {option.name}
                      {option.price > 0 && (
                        <span className="text-primary ml-2">+{option.price.toFixed(2)}€</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Edit className="w-4 h-4" />
              Modifier
            </Button>
            <Button variant="destructive" size="sm" className="gap-2">
              <Trash2 className="w-4 h-4" />
              Supprimer
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
