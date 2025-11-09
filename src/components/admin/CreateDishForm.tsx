import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MenuItem, Option } from "@/data/mockdata";
import { Plus, X } from "lucide-react";

interface CreateDishFormProps {
  categoryId: string;
  onSuccess: (item: MenuItem) => void;
}

interface FormOption {
  id: string;
  name: string;
  price: string;
}

export const CreateDishForm = ({ categoryId, onSuccess }: CreateDishFormProps) => {
  const [dishName, setDishName] = useState("");
  const [dishPrice, setDishPrice] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🍽️");
  const [selectionType, setSelectionType] = useState<"single" | "multiple">("multiple");
  const [options, setOptions] = useState<FormOption[]>([]);
  const [optionName, setOptionName] = useState("");
  const [optionPrice, setOptionPrice] = useState("");

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dishName.trim() || !dishPrice) {
      return;
    }

    const newItem: MenuItem = {
      id: `item_${Date.now()}`,
      name: dishName,
      description: description,
      price: parseFloat(dishPrice),
      image: emoji,
      categoryId: categoryId,
      options: options.length > 0 ? options.map(opt => ({
        id: opt.id,
        name: opt.name,
        price: parseFloat(opt.price)
      })) : undefined
    };

    onSuccess(newItem);
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
        <Button type="submit" size="lg" className="flex-1">
          Créer le plat
        </Button>
      </div>
    </form>
  );
};
