import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Utensils, Package, ShoppingBasket, ArrowLeft } from "lucide-react";

type EstablishmentType = "restaurant" | "beverage_depot" | "grocery_store";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [establishmentName, setEstablishmentName] = useState("");
  const [establishmentType, setEstablishmentType] = useState<EstablishmentType>("restaurant");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        toast({ title: "Connexion réussie" });
        navigate("/dashboard");
      } else {
        if (!establishmentName.trim()) {
          toast({ title: "Erreur", description: "Le nom de l'établissement est requis", variant: "destructive" });
          setIsLoading(false);
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        
        if (authError) throw authError;

        if (authData.user) {
          const { error: establishmentError } = await supabase
            .from("establishments")
            .insert({
              owner_id: authData.user.id,
              name: establishmentName,
              type: establishmentType,
            });

          if (establishmentError) throw establishmentError;
        }

        toast({ 
          title: "Inscription réussie", 
          description: "Vérifiez votre email pour confirmer votre compte" 
        });
      }
    } catch (error: any) {
      toast({ 
        title: "Erreur", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const establishmentOptions = [
    {
      value: "restaurant" as const,
      label: "Restaurant",
      description: "Plats, menus, configurations",
      icon: Utensils,
    },
    {
      value: "beverage_depot" as const,
      label: "Dépôt de Boissons",
      description: "Casiers, bouteilles, consignes",
      icon: Package,
    },
    {
      value: "grocery_store" as const,
      label: "Alimentation",
      description: "Produits, prix unitaires",
      icon: ShoppingBasket,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <CardTitle className="text-2xl font-bold">
            {isLogin ? "Connexion" : "Inscription"}
          </CardTitle>
          <CardDescription>
            {isLogin 
              ? "Connectez-vous à votre compte" 
              : "Créez votre établissement"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="establishmentName">Nom de l'établissement</Label>
                  <Input
                    id="establishmentName"
                    value={establishmentName}
                    onChange={(e) => setEstablishmentName(e.target.value)}
                    placeholder="Mon Restaurant"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label>Type d'établissement</Label>
                  <RadioGroup
                    value={establishmentType}
                    onValueChange={(value) => setEstablishmentType(value as EstablishmentType)}
                    className="grid gap-3"
                  >
                    {establishmentOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          establishmentType === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setEstablishmentType(option.value)}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <option.icon className="h-5 w-5 text-primary" />
                        <div className="flex-1">
                          <Label htmlFor={option.value} className="cursor-pointer font-medium">
                            {option.label}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Chargement..." : isLogin ? "Se connecter" : "Créer mon compte"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? "Pas de compte ? Inscrivez-vous" : "Déjà un compte ? Connectez-vous"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
