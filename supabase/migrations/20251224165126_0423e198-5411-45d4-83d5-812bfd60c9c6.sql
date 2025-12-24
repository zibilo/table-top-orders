
-- Enum pour les types d'établissement
CREATE TYPE public.establishment_type AS ENUM ('restaurant', 'beverage_depot', 'grocery_store');

-- Enum pour les rôles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'staff');

-- Table des établissements
CREATE TABLE public.establishments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type establishment_type NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table des rôles utilisateurs
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    establishment_id UUID REFERENCES public.establishments(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'staff',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, establishment_id)
);

-- Tables spécifiques Dépôt de Boissons
CREATE TABLE public.beverage_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID REFERENCES public.establishments(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    unit_price NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.crates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beverage_type_id UUID REFERENCES public.beverage_types(id) ON DELETE CASCADE NOT NULL,
    bottles_per_crate INTEGER NOT NULL DEFAULT 12,
    deposit_price NUMERIC NOT NULL DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tables spécifiques Alimentation
CREATE TABLE public.grocery_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    establishment_id UUID REFERENCES public.establishments(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    barcode TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beverage_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_products ENABLE ROW LEVEL SECURITY;

-- Fonction pour vérifier le rôle (Security Definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _establishment_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND establishment_id = _establishment_id
      AND role = _role
  )
$$;

-- Fonction pour vérifier si l'utilisateur est propriétaire
CREATE OR REPLACE FUNCTION public.is_owner(_user_id UUID, _establishment_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.establishments
    WHERE id = _establishment_id
      AND owner_id = _user_id
  )
$$;

-- RLS Policies pour establishments
CREATE POLICY "Users can view their own establishments"
ON public.establishments FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can create establishments"
ON public.establishments FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their establishments"
ON public.establishments FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their establishments"
ON public.establishments FOR DELETE
USING (owner_id = auth.uid());

-- RLS Policies pour user_roles
CREATE POLICY "Users can view roles in their establishments"
ON public.user_roles FOR SELECT
USING (public.is_owner(auth.uid(), establishment_id) OR user_id = auth.uid());

CREATE POLICY "Owners can manage roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.is_owner(auth.uid(), establishment_id));

CREATE POLICY "Owners can update roles"
ON public.user_roles FOR UPDATE
USING (public.is_owner(auth.uid(), establishment_id));

CREATE POLICY "Owners can delete roles"
ON public.user_roles FOR DELETE
USING (public.is_owner(auth.uid(), establishment_id));

-- RLS Policies pour beverage_types
CREATE POLICY "Users can view beverage types"
ON public.beverage_types FOR SELECT
USING (public.is_owner(auth.uid(), establishment_id));

CREATE POLICY "Owners can manage beverage types"
ON public.beverage_types FOR ALL
USING (public.is_owner(auth.uid(), establishment_id));

-- RLS Policies pour crates
CREATE POLICY "Users can view crates"
ON public.crates FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.beverage_types bt
  WHERE bt.id = beverage_type_id
  AND public.is_owner(auth.uid(), bt.establishment_id)
));

CREATE POLICY "Owners can manage crates"
ON public.crates FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.beverage_types bt
  WHERE bt.id = beverage_type_id
  AND public.is_owner(auth.uid(), bt.establishment_id)
));

-- RLS Policies pour grocery_products
CREATE POLICY "Users can view grocery products"
ON public.grocery_products FOR SELECT
USING (public.is_owner(auth.uid(), establishment_id));

CREATE POLICY "Owners can manage grocery products"
ON public.grocery_products FOR ALL
USING (public.is_owner(auth.uid(), establishment_id));

-- Trigger pour updated_at
CREATE TRIGGER update_establishments_updated_at
BEFORE UPDATE ON public.establishments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_beverage_types_updated_at
BEFORE UPDATE ON public.beverage_types
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crates_updated_at
BEFORE UPDATE ON public.crates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grocery_products_updated_at
BEFORE UPDATE ON public.grocery_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
