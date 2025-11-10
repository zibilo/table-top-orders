-- Enable admin operations on tables
CREATE POLICY "Anyone can insert tables"
ON public.tables FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update tables"
ON public.tables FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete tables"
ON public.tables FOR DELETE
USING (true);

-- Enable admin operations on categories
CREATE POLICY "Anyone can insert categories"
ON public.categories FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update categories"
ON public.categories FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete categories"
ON public.categories FOR DELETE
USING (true);

-- Enable admin operations on menu_items
CREATE POLICY "Anyone can insert menu items"
ON public.menu_items FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update menu items"
ON public.menu_items FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete menu items"
ON public.menu_items FOR DELETE
USING (true);

-- Enable admin operations on options
CREATE POLICY "Anyone can insert options"
ON public.options FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update options"
ON public.options FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete options"
ON public.options FOR DELETE
USING (true);

-- Enable admin operations on option_choices
CREATE POLICY "Anyone can insert option choices"
ON public.option_choices FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update option choices"
ON public.option_choices FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete option choices"
ON public.option_choices FOR DELETE
USING (true);

-- Enable admin operations on orders
CREATE POLICY "Anyone can update orders"
ON public.orders FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete orders"
ON public.orders FOR DELETE
USING (true);

-- Enable admin operations on notifications
CREATE POLICY "Anyone can update notifications"
ON public.notifications FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete notifications"
ON public.notifications FOR DELETE
USING (true);

CREATE POLICY "Anyone can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);