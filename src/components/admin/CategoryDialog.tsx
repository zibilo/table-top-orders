import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const CategoryDialog = ({ category, onSuccess }: { category?: any; onSuccess: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (category) {
      setCategoryName(category.name);
    } else {
      setCategoryName("");
      setImage(null);
    }
  }, [category, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryName.trim()) return;
    if (!category && !image) return; // Image requise seulement pour nouvelle catégorie

    setIsLoading(true);
    
    try {
      let imageUrl = category?.image_url || "";

      // Upload nouvelle image si fournie
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('category-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('category-images')
          .getPublicUrl(fileName);
        
        imageUrl = publicUrl;
      }

      if (category) {
        // Modification
        const { error } = await supabase
          .from('categories')
          .update({ name: categoryName, image_url: imageUrl })
          .eq('id', category.id);

        if (error) throw error;

        toast({
          title: "Catégorie modifiée ! 🎉",
          description: `${categoryName} a été mise à jour`,
        });
      } else {
        // Création
        const { error } = await supabase
          .from('categories')
          .insert([{ name: categoryName, image_url: imageUrl }]);

        if (error) throw error;

        toast({
          title: "Catégorie créée ! 🎉",
          description: `${categoryName} a été ajoutée`,
        });
      }

      setCategoryName("");
      setImage(null);
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      toast({
        title: "Erreur",
        description: category ? "Impossible de modifier la catégorie" : "Impossible de créer la catégorie",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {category ? (
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 bg-primary/10 hover:bg-primary hover:text-primary-foreground"
            onClick={(e) => e.stopPropagation()}
          >
            <Edit className="w-3 h-3" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            Nouvelle catégorie
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Modifier la catégorie" : "Créer une nouvelle catégorie"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Nom de la catégorie</Label>
            <Input
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Ex: Hamburgers"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryImage">
              Image de la catégorie {category && "(optionnel pour modification)"}
            </Label>
            {category?.image_url && !image && (
              <div className="mb-2">
                <img 
                  src={category.image_url} 
                  alt={category.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </div>
            )}
            <Input
              id="categoryImage"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] || null)}
              required={!category}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (category ? "Modification..." : "Création...") : (category ? "Modifier" : "Créer")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
