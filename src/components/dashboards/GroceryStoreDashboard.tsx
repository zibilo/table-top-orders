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
import { Plus, ShoppingBasket, Trash2, Edit2, BarChart3, Search } from "lucide-react";

interface GroceryStoreDashboardProps {
  establishmentId: string;
}

interface GroceryProduct {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  barcode: string | null;
}

const GroceryStoreDashboard = ({ establishmentId }: GroceryStoreDashboardProps) => {
  const { toast } = useToast();
  const [products, setProducts] = useState<GroceryProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<GroceryProduct[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<GroceryProduct | null>(null);
  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    price: 0, 
    stock_quantity: 0, 
    barcode: "" 
  });

  useEffect(() => {
    fetchProducts();
  }, [establishmentId]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.barcode && p.barcode.includes(searchTerm))
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("grocery_products")
      .select("*")
      .eq("establishment_id", establishmentId)
      .order("name");

    if (!error && data) {
      setProducts(data);
      setFilteredProducts(data);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      toast({ title: "Erreur", description: "Le nom est requis", variant: "destructive" });
      return;
    }

    const { error } = await supabase.from("grocery_products").insert({
      establishment_id: establishmentId,
      name: newProduct.name,
      price: newProduct.price,
      stock_quantity: newProduct.stock_quantity,
      barcode: newProduct.barcode || null,
    });

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produit ajouté" });
      setNewProduct({ name: "", price: 0, stock_quantity: 0, barcode: "" });
      setIsAddProductOpen(false);
      fetchProducts();
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    const { error } = await supabase
      .from("grocery_products")
      .update({
        name: editingProduct.name,
        price: editingProduct.price,
        stock_quantity: editingProduct.stock_quantity,
        barcode: editingProduct.barcode,
      })
      .eq("id", editingProduct.id);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Produit mis à jour" });
      setEditingProduct(null);
      fetchProducts();
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from("grocery_products").delete().eq("id", id);
    if (!error) {
      toast({ title: "Produit supprimé" });
      fetchProducts();
    }
  };

  const handleQuickStockUpdate = async (id: string, delta: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    const newQuantity = Math.max(0, product.stock_quantity + delta);
    const { error } = await supabase
      .from("grocery_products")
      .update({ stock_quantity: newQuantity })
      .eq("id", id);

    if (!error) {
      fetchProducts();
    }
  };

  const totalValue = products.reduce((acc, p) => acc + p.price * p.stock_quantity, 0);
  const lowStockProducts = products.filter((p) => p.stock_quantity < 5);

  return (
    <Tabs defaultValue="products" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="products" className="flex items-center gap-2">
          <ShoppingBasket className="h-4 w-4" />
          <span className="hidden sm:inline">Produits</span>
        </TabsTrigger>
        <TabsTrigger value="stats" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Inventaire</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="products">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <CardTitle>Produits</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[200px]"
                />
              </div>
              <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nouveau Produit</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nom</Label>
                      <Input
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Ex: Riz 5kg"
                      />
                    </div>
                    <div>
                      <Label>Prix (FCFA)</Label>
                      <Input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Quantité en stock</Label>
                      <Input
                        type="number"
                        value={newProduct.stock_quantity}
                        onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Code-barres (optionnel)</Label>
                      <Input
                        value={newProduct.barcode}
                        onChange={(e) => setNewProduct({ ...newProduct, barcode: e.target.value })}
                        placeholder="Ex: 123456789"
                      />
                    </div>
                    <Button onClick={handleAddProduct} className="w-full">
                      Ajouter
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Code-barres</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.price} FCFA</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickStockUpdate(product.id, -1)}
                        >
                          -
                        </Button>
                        <span className={`w-12 text-center ${product.stock_quantity < 5 ? "text-destructive font-bold" : ""}`}>
                          {product.stock_quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickStockUpdate(product.id, 1)}
                        >
                          +
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {product.barcode || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Aucun produit
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Product Dialog */}
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier Produit</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <div className="space-y-4">
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Prix (FCFA)</Label>
                  <Input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Quantité en stock</Label>
                  <Input
                    type="number"
                    value={editingProduct.stock_quantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Code-barres</Label>
                  <Input
                    value={editingProduct.barcode || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                  />
                </div>
                <Button onClick={handleUpdateProduct} className="w-full">
                  Enregistrer
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </TabsContent>

      <TabsContent value="stats">
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-sm text-muted-foreground">Produits</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {products.reduce((acc, p) => acc + p.stock_quantity, 0)}
              </div>
              <p className="text-sm text-muted-foreground">Articles en stock</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totalValue.toLocaleString()} FCFA</div>
              <p className="text-sm text-muted-foreground">Valeur totale</p>
            </CardContent>
          </Card>
        </div>

        {lowStockProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Stock Faible</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Quantité</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-destructive font-bold">
                        {product.stock_quantity}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default GroceryStoreDashboard;
