import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateDishFormProps {
  categoryId: string;
  editingItem?: any;
  onSuccess: () => void;
}

interface FormOption {
  id: string;
  name: string;
  price: string;
}

export const CreateDishForm = ({ categoryId, editingItem, onSuccess }: CreateDishFormProps) => {
  const [dishName, setDishName] = useState("");
  const [dishPrice, setDishPrice] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🍽️");
  const [image, setImage] = useState<File | null>(null);
  const [selectionType, setSelectionType] = useState<"single" | "multiple">("multiple");
  const [options, setOptions] = useState<FormOption[]>([]);
  const [optionName, setOptionName] = useState("");
  const [optionPrice, setOptionPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Charger les données du plat à modifier
  useEffect(() => {
    if (editingItem) {
      setDishName(editingItem.name || "");
      setDishPrice(editingItem.price?.toString() || "");
      setDescription(editingItem.description || "");
      setEmoji(editingItem.emoji || "🍽️");
      
      // Charger les options existantes
      if (editingItem.options && editingItem.options.length > 0) {
        const firstOption = editingItem.options[0];
        setSelectionType(firstOption.is_multiple_choice ? "multiple" : "single");
        
        if (firstOption.option_choices && firstOption.option_choices.length > 0) {
          const loadedOptions = firstOption.option_choices.map((choice: any) => ({
            id: choice.id,
            name: choice.name,
            price: choice.price?.toString() || "0"
          }));
          setOptions(loadedOptions);
        }
      }
    } else {
      // Réinitialiser pour un nouveau plat
      setDishName("");
      setDishPrice("");
      setDescription("");
      setEmoji("🍽️");
      setImage(null);
      setSelectionType("multiple");
      setOptions([]);
    }
  }, [editingItem]);

  const addOption = () => {
    if (optionName.trim()) {
      const newOption: FormOption = {
        id: `opt_${Date.now()}`,
        name: optionName,
        price: optionPrice || "0"
      };
      setOptions([...options, newOption]);
      setOptionName("");
      setOptionPrice("");
    }
  };

  const removeOption = (id: string) => {
    setOptions(options.filter(opt => opt.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dishName.trim() || !dishPrice) {
      return;
    }

    // Image requise seulement pour nouveau plat
    if (!editingItem && !image) {
      return;
    }

    setIsLoading(true);

    try {
      let imageUrl = editingItem?.image_url || "";

      // Upload nouvelle image si fournie
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('menu-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('menu-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      if (editingItem) {
        // Mode modification
        const { error: updateError } = await supabase
          .from('menu_items')
          .update({
            name: dishName,
            description: description,
            price: parseFloat(dishPrice),
            emoji: emoji,
            image_url: imageUrl,
            category_id: categoryId,
          })
          .eq('id', editingItem.id);

        if (updateError) throw updateError;

        // Supprimer les anciennes options
        if (editingItem.options && editingItem.options.length > 0) {
          for (const option of editingItem.options) {
            await supabase
              .from('option_choices')
              .delete()
              .eq('option_id', option.id);
            
            await supabase
              .from('options')
              .delete()
              .eq('id', option.id);
          }
        }

        // Ajouter les nouvelles options si présentes
        if (options.length > 0) {
          const { data: optionData, error: optionError } = await supabase
            .from('options')
            .insert([{
              menu_item_id: editingItem.id,
              name: 'Options',
              is_multiple_choice: selectionType === 'multiple'
            }])
            .select()
            .single();

          if (!optionError && optionData) {
            const choices = options.map(opt => ({
              option_id: optionData.id,
              name: opt.name,
              price: parseFloat(opt.price)
            }));

            await supabase
              .from('option_choices')
              .insert(choices);
          }
        }

        toast({
          title: "Plat modifié ! 🎉",
          description: `${dishName} a été mis à jour`,
        });
      } else {
        // Mode création
        const { data: menuItem, error: menuError } = await supabase
          .from('menu_items')
          .insert([{
            name: dishName,
            description: description,
            price: parseFloat(dishPrice),
            emoji: emoji,
            image_url: imageUrl,
            category_id: categoryId,
            is_available: true
          }])
          .select()
          .single();

        if (menuError || !menuItem) {
          toast({
            title: "Erreur",
            description: "Impossible de créer le plat",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Insert options if any
        if (options.length > 0) {
          const { data: optionData, error: optionError } = await supabase
            .from('options')
            .insert([{
              menu_item_id: menuItem.id,
              name: 'Options',
              is_multiple_choice: selectionType === 'multiple'
            }])
            .select()
            .single();

          if (!optionError && optionData) {
            const choices = options.map(opt => ({
              option_id: optionData.id,
              name: opt.name,
              price: parseFloat(opt.price)
            }));

            await supabase
              .from('option_choices')
              .insert(choices);
          }
        }

        toast({
          title: "Plat créé ! 🎉",
          description: `${dishName} a été ajouté`,
        });
      }

      setIsLoading(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Erreur",
        description: editingItem ? "Impossible de modifier le plat" : "Impossible de créer le plat",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="dishName" className="text-base">Nom du plat *</Label>
          <Input
            id="dishName"
            value={dishName}
            onChange={(e) => setDishName(e.target.value)}
            placeholder="Ex: Hamburger Royal"
            required
            className="h-12 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-base">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Pain brioché, steak haché, fromage..."
            className="h-12 text-base"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dishPrice" className="text-base">Prix (€) *</Label>
            <Input
              id="dishPrice"
              type="number"
              step="0.01"
              min="0"
              value={dishPrice}
              onChange={(e) => setDishPrice(e.target.value)}
              placeholder="0.00"
              required
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emoji" className="text-base">Emoji</Label>
            <Input
              id="emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              placeholder="🍽️"
              className="h-12 text-base text-center text-2xl"
              maxLength={2}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dishImage" className="text-base">
            Image du plat {editingItem ? "(optionnel pour modification)" : "*"}
          </Label>
          {editingItem?.image_url && !image && (
            <div className="mb-2">
              <img 
                src={editingItem.image_url} 
                alt={editingItem.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
            </div>
          )}
          <Input
            id="dishImage"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            required={!editingItem}
            className="h-12 text-base"
          />
        </div>
      </div>

      {/* Section Options */}
      <div className="space-y-4 border-t pt-6">
        <div>
          <Label className="text-lg font-semibold">Options personnalisables</Label>
          <p className="text-sm text-muted-foreground">Champ non obligatoire</p>
        </div>

        {/* Type de sélection */}
        <div className="space-y-3">
          <Label className="text-base">Type de sélection</Label>
          <RadioGroup value={selectionType} onValueChange={(value: "single" | "multiple") => setSelectionType(value)}>
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <RadioGroupItem value="multiple" id="multiple" />
              <Label htmlFor="multiple" className="cursor-pointer flex-grow text-base font-normal">
                Choix multiple (cases à cocher)
              </Label>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
              <RadioGroupItem value="single" id="single" />
              <Label htmlFor="single" className="cursor-pointer flex-grow text-base font-normal">
                Choix unique (bouton radio)
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Ajouter une option */}
        <div className="space-y-3 p-4 bg-accent/20 rounded-lg">
          <Label className="text-base font-semibold">Ajouter une option</Label>
          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <Input
              value={optionName}
              onChange={(e) => setOptionName(e.target.value)}
              placeholder="Nom de l'option"
              className="h-12 text-base"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
            />
            <Input
              type="number"
              step="0.01"
              min="0"
              value={optionPrice}
              onChange={(e) => setOptionPrice(e.target.value)}
              placeholder="Prix (€)"
              className="h-12 text-base w-28"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
            />
            <Button type="button" onClick={addOption} size="sm" className="h-12 px-4">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Liste des options */}
        {options.length > 0 && (
          <div className="space-y-2">
            <Label className="text-base font-semibold">Options ajoutées ({options.length})</Label>
            <div className="space-y-2">
              {options.map((option) => (
                <div key={option.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-grow">
                    <span className="font-medium">{option.name}</span>
                    {parseFloat(option.price) > 0 && (
                      <span className="text-primary ml-2">+{parseFloat(option.price).toFixed(2)}€</span>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(option.id)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Boutons d'action */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" size="lg" className="flex-1" disabled={isLoading}>
          {isLoading ? (editingItem ? "Modification..." : "Création...") : (editingItem ? "Modifier le plat" : "Créer le plat")}
        </Button>
      </div>
    </form>
  );
};
