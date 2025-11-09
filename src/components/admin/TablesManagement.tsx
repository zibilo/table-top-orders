import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const TablesManagement = () => {
  const [tables, setTables] = useState<any[]>([]);
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

  const handleAddTable = async () => {
    const maxTableNumber = tables.length > 0 
      ? Math.max(...tables.map(t => t.table_number))
      : 0;

    const { error } = await supabase
      .from('tables')
      .insert([{ table_number: maxTableNumber + 1, is_active: true }]);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la table",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Table ajoutée",
      description: `Table ${maxTableNumber + 1} créée avec succès`,
    });

    fetchTables();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestion des Tables 🪑</h2>
          <p className="text-muted-foreground">Gérez les tables disponibles pour les clients</p>
        </div>
        <Button size="lg" className="gap-2" onClick={handleAddTable}>
          <Plus />
          Ajouter une table
        </Button>
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
