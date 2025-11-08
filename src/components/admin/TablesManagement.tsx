import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { TABLES, Table } from "@/data/mockdata";
import { Plus, Edit } from "lucide-react";

export const TablesManagement = () => {
  const [tables, setTables] = useState<Table[]>(TABLES);

  const handleToggleTable = (tableId: string) => {
    setTables(tables.map(table => 
      table.id === tableId ? { ...table, isActive: !table.isActive } : table
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestion des Tables 🪑</h2>
          <p className="text-muted-foreground">Gérez les tables disponibles pour les clients</p>
        </div>
        <Button size="lg" className="gap-2">
          <Plus />
          Ajouter une table
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {tables.map(table => (
          <Card 
            key={table.id} 
            className={`p-6 ${table.isActive ? 'border-primary' : 'opacity-50'}`}
          >
            <div className="text-center space-y-4">
              <div className="text-5xl font-bold text-primary">
                {table.number}
              </div>
              
              <div className="flex items-center justify-center space-x-2">
                <Switch
                  id={`table-${table.id}`}
                  checked={table.isActive}
                  onCheckedChange={() => handleToggleTable(table.id)}
                />
                <Label htmlFor={`table-${table.id}`} className="cursor-pointer">
                  {table.isActive ? 'Active' : 'Inactive'}
                </Label>
              </div>

              <Button variant="outline" size="sm" className="w-full gap-2">
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
