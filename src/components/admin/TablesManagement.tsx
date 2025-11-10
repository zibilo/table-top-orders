import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const TablesManagement = () => {
  const [tables, setTables] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState("");
  const { toast } = useToast();

  const fetchTables = async () => {
    const { data } = await supabase
      .from('tables')
      .select('*')
      .order('table_number');
    
    if (data) setTables(data);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleToggleTable = async (tableId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('tables')
      .update({ is_active: !currentStatus })
      .eq('id', tableId);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la table",
        variant: "destructive",
      });
      return;
    }

    fetchTables();
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber) return;

    try {
      const tableNum = parseInt(tableNumber);
      
      // Check if table number already exists
      const { data: existing } = await supabase
        .from("tables")
        .select("id")
        .eq("table_number", tableNum)
        .single();

      if (existing) {
        toast({
          title: "Erreur",
          description: "Ce numéro de table existe déjà",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('tables')
        .insert([{ table_number: tableNum, is_active: true }]);

      if (error) throw error;

      toast({
        title: "Table ajoutée",
        description: `Table ${tableNum} créée avec succès`,
      });

      setTableNumber("");
      setDialogOpen(false);
      fetchTables();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la table",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestion des Tables 🪑</h2>
          <p className="text-muted-foreground">Gérez les tables disponibles pour les clients</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus />
              Ajouter une table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une table</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTable} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tableNumber">Numéro de table</Label>
                <Input
                  id="tableNumber"
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Ex: 1, 2, 3..."
                  required
                  min="1"
                />
              </div>
              <Button type="submit" className="w-full">
                Créer la table
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map(table => (
          <Card 
            key={table.id} 
            className={`p-6 ${table.is_active ? 'border-primary' : 'opacity-50'}`}
          >
            <div className="text-center space-y-4">
              <div className="text-5xl font-bold text-primary">
                {table.table_number}
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <Switch
                  id={`table-${table.id}`}
                  checked={table.is_active}
                  onCheckedChange={() => handleToggleTable(table.id, table.is_active)}
                />
                <Label htmlFor={`table-${table.id}`} className="cursor-pointer">
                  {table.is_active ? 'Active' : 'Inactive'}
                </Label>
              </div>

              <Button variant="outline" size="sm" className="w-full gap-2" disabled>
                <Edit className="w-4 h-4" />
                Modifier
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
