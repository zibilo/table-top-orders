import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Lock, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ADMIN_CREDENTIALS } from "@/data/mockdata";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulation d'une vérification
    setTimeout(() => {
      if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        toast({
          title: "Connexion réussie ! ✅",
          description: `Bienvenue ${ADMIN_CREDENTIALS.name}`,
        });
        // Stocker l'état de connexion
        sessionStorage.setItem("adminAuth", "true");
        navigate("/admin");
      } else {
        toast({
          title: "Erreur de connexion ❌",
          description: "Nom d'utilisateur ou mot de passe incorrect",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-8 shadow-lg">
        {/* Bouton retour */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/")}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>

        {/* En-tête */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-primary rounded-full p-6 shadow-md">
              <Lock className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Administration 🔐
          </h1>
          <p className="text-muted-foreground">
            Connectez-vous pour accéder au panneau d'administration
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Nom d'utilisateur</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        {/* Indications pour le développement */}
        <div className="mt-6 p-4 bg-accent/50 rounded-lg">
          <p className="text-sm text-center text-muted-foreground">
            <strong>Identifiants de test :</strong><br />
            Utilisateur: <code className="bg-muted px-2 py-1 rounded">admin</code><br />
            Mot de passe: <code className="bg-muted px-2 py-1 rounded">admin123</code>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
