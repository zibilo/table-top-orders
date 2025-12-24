import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Package, Archive, Trash2, BarChart3 } from "lucide-react";

interface BeverageDepotDashboardProps {
  establishmentId: string;
}

interface BeverageType {
  id: string;
  name: string;
  unit_price: number;
}

interface Crate {
  id: string;
  beverage_type_id: string;
  bottles_per_crate: number;
  deposit_price: number;
  stock_quantity: number;
  beverage_type?: BeverageType;
}

const BeverageDepotDashboard = ({ establishmentId }: BeverageDepotDashboardProps) => {
  const { toast } = useToast();
  const [beverageTypes, setBeverageTypes] = useState<BeverageType[]>([]);
  const [crates, setCrates] = useState<Crate[]>([]);
  const [isAddBeverageOpen, setIsAddBeverageOpen] = useState(false);
  const [isAddCrateOpen, setIsAddCrateOpen] = useState(false);
  const [newBeverage, setNewBeverage] = useState({ name: "", unit_price: 0 });
  const [newCrate, setNewCrate] = useState({ 
    beverage_type_id: "", 
    bottles_per_crate: 12, 
    deposit_price: 0, 
    stock_quantity: 0 
  });

  useEffect(() => {
    fetchBeverageTypes();
    fetchCrates();
  }, [establishmentId]);

  const fetchBeverageTypes = async () => {
    const { data, error } = await supabase
      .from("beverage_types")
      .select("*")
      .eq("establishment_id", establishmentId)
      .order("name");

    if (!error && data) {
      setBeverageTypes(data);
    }
  };

  const fetchCrates = async () => {
    const { data, error } = await supabase
      .from("crates")
      .select(`
        *,
        beverage_type:beverage_types(*)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setCrates(data as any);
    }
  };

  const handleAddBeverage = async () => {
    if (!newBeverage.name.trim()) {
      toast({ title: "Erreur", description: "Le nom est requis", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("beverage_types").insert({
      establishment_id: establishmentId,
      name: newBeverage.name,
      unit_price: newBeverage.unit_price,
    });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Type de boisson ajouté" });
      setNewBeverage({ name: "", unit_price: 0 });
      setIsAddBeverageOpen(false);
      fetchBeverageTypes();
    }
  };

  const handleAddCrate = async () => {
    if (!newCrate.beverage_type_id) {
      toast({ title: "Erreur", description: "Sélectionnez un type de boisson", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("crates").insert({
      beverage_type_id: newCrate.beverage_type_id,
      bottles_per_crate: newCrate.bottles_per_crate,
      deposit_price: newCrate.deposit_price,
      stock_quantity: newCrate.stock_quantity,
    });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Casier ajouté" });
      setNewCrate({ beverage_type_id: "", bottles_per_crate: 12, deposit_price: 0, stock_quantity: 0 });
      setIsAddCrateOpen(false);
      fetchCrates();
    }
  };

  const handleDeleteBeverage = async (id: string) => {
    const { error } = await supabase.from("beverage_types").delete().eq("id", id);
    if (!error) {
      toast({ title: "Type de boisson supprimé" });
      fetchBeverageTypes();
      fetchCrates();
    }
  };

  const handleUpdateStock = async (crateId: string, newQuantity: number) => {
    const { error } = await supabase
      .from("crates")
      .update({ stock_quantity: newQuantity })
      .eq("id", crateId);

    if (!error) {
      fetchCrates();
    }
  };

  return (
    <Tabs defaultValue="beverages" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="beverages" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Boissons</span>
        </TabsTrigger>
        <TabsTrigger value="crates" className="flex items-center gap-2">
          <Archive className="h-4 w-4" />
          <span className="hidden sm:inline">Casiers</span>
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Stock</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="beverages">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Types de Boissons</CardTitle>
            <Dialog open={isAddBeverageOpen} onOpenChange={setIsAddBeverageOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau Type de Boisson</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nom</Label>
                    <Input
                      value={newBeverage.name}
                      onChange={(e) => setNewBeverage({ ...newBeverage, name: e.target.value })}
                      placeholder="Ex: Bière Castel"
                    />
                  </div>
                  <div>
                    <Label>Prix unitaire (FCFA)</Label>
                    <Input
                      type="number"
                      value={newBeverage.unit_price}
                      onChange={(e) => setNewBeverage({ ...newBeverage, unit_price: Number(e.target.value) })}
                    />
                  </div>
                  <Button onClick={handleAddBeverage} className="w-full">
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prix Unitaire</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {beverageTypes.map((beverage) => (
                  <TableRow key={beverage.id}>
                    <TableCell className="font-medium">{beverage.name}</TableCell>
                    <TableCell>{beverage.unit_price} FCFA</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBeverage(beverage.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {beverageTypes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Aucun type de boisson
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="crates">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Gestion des Casiers</CardTitle>
            <Dialog open={isAddCrateOpen} onOpenChange={setIsAddCrateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter Casier
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau Casier</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Type de boisson</Label>
                    <select
                      className="w-full border rounded-md p-2"
                      value={newCrate.beverage_type_id}
                      onChange={(e) => setNewCrate({ ...newCrate, beverage_type_id: e.target.value })}
                    >
                      <option value="">Sélectionner...</option>
                      {beverageTypes.map((bt) => (
                        <option key={bt.id} value={bt.id}>{bt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Bouteilles par casier</Label>
                    <Input
                      type="number"
                      value={newCrate.bottles_per_crate}
                      onChange={(e) => setNewCrate({ ...newCrate, bottles_per_crate: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Prix consigne (FCFA)</Label>
                    <Input
                      type="number"
                      value={newCrate.deposit_price}
                      onChange={(e) => setNewCrate({ ...newCrate, deposit_price: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Quantité en stock</Label>
                    <Input
                      type="number"
                      value={newCrate.stock_quantity}
                      onChange={(e) => setNewCrate({ ...newCrate, stock_quantity: Number(e.target.value) })}
                    />
                  </div>
                  <Button onClick={handleAddCrate} className="w-full">
                    Ajouter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Boisson</TableHead>
                  <TableHead>Bouteilles/Casier</TableHead>
                  <TableHead>Consigne</TableHead>
                  <TableHead>Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crates.map((crate) => (
                  <TableRow key={crate.id}>
                    <TableCell className="font-medium">{crate.beverage_type?.name}</TableCell>
                    <TableCell>{crate.bottles_per_crate}</TableCell>
                    <TableCell>{crate.deposit_price} FCFA</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStock(crate.id, Math.max(0, crate.stock_quantity - 1))}
                        >
                          -
                        </Button>
                        <span className="w-12 text-center">{crate.stock_quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStock(crate.id, crate.stock_quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {crates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Aucun casier
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stats">
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{beverageTypes.length}</div>
                  <p className="text-sm text-muted-foreground">Types de boissons</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {crates.reduce((acc, c) => acc + c.stock_quantity, 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Casiers en stock</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {crates.reduce((acc, c) => acc + (c.stock_quantity * c.bottles_per_crate), 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Bouteilles totales</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default BeverageDepotDashboard;
