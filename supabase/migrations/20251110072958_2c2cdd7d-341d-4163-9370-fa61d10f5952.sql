-- Add image_url columns to categories and menu_items tables
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage buckets for category and menu item images
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('category-images', 'category-images', true),
  ('menu-images', 'menu-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for category-images bucket
CREATE POLICY "Anyone can view category images"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-images');

CREATE POLICY "Anyone can upload category images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'category-images');

CREATE POLICY "Anyone can update category images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'category-images');

CREATE POLICY "Anyone can delete category images"
ON storage.objects FOR DELETE
USING (bucket_id = 'category-images');

-- Create RLS policies for menu-images bucket
CREATE POLICY "Anyone can view menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

CREATE POLICY "Anyone can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "Anyone can update menu images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'menu-images');

CREATE POLICY "Anyone can delete menu images"
ON storage.objects FOR DELETE
USING (bucket_id = 'menu-images');