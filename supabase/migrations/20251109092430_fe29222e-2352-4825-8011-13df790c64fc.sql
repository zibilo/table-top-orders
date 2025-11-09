-- Fix security warning: Set search_path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix security warning: Set search_path for create_order_notification function
CREATE OR REPLACE FUNCTION public.create_order_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.notifications (type, message, order_id)
    VALUES (
        'new_order',
        'Nouvelle commande pour la table ' || (SELECT table_number FROM public.tables WHERE id = NEW.table_id),
        NEW.id
    );
    RETURN NEW;
END;
$$;