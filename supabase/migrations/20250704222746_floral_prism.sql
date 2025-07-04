/*
  # Create products table

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text, nullable)
      - `price` (decimal)
      - `category_id` (uuid, foreign key to categories)
      - `image_url` (text, nullable)
      - `is_available` (boolean, default true)
      - `display_order` (integer, default 0)
      - `stock_enabled` (boolean, default false)
      - `stock_quantity` (integer, nullable)
      - `stock_variants` (jsonb, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policy for authenticated users to read available products
    - Add policy for admins to manage products

  3. Sample Data
    - Insert initial products
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text,
  is_available boolean DEFAULT true,
  display_order integer DEFAULT 0,
  stock_enabled boolean DEFAULT false,
  stock_quantity integer,
  stock_variants jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read available products"
  ON products
  FOR SELECT
  TO authenticated
  USING (is_available = true);

CREATE POLICY "Admins can read all products"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products
DO $$
DECLARE
  cat_boissons uuid;
  cat_en_cas_sale uuid;
  cat_en_cas_sucre uuid;
  cat_plats_principaux uuid;
  cat_entrees uuid;
  cat_desserts uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_boissons FROM categories WHERE slug = 'boissons';
  SELECT id INTO cat_en_cas_sale FROM categories WHERE slug = 'en-cas-sale';
  SELECT id INTO cat_en_cas_sucre FROM categories WHERE slug = 'en-cas-sucre';
  SELECT id INTO cat_plats_principaux FROM categories WHERE slug = 'plats-principaux';
  SELECT id INTO cat_entrees FROM categories WHERE slug = 'entrees';
  SELECT id INTO cat_desserts FROM categories WHERE slug = 'desserts';

  -- Insert products
  INSERT INTO products (name, description, price, category_id, image_url, is_available, display_order, stock_enabled, stock_quantity, stock_variants) VALUES
    -- BOISSONS
    ('Bières haut de gamme', 'Sélection de bières premium', 0.50, cat_boissons, 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg', true, 1, false, null, null),
    ('Bières basiques', 'Bières classiques', 0.50, cat_boissons, 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg', true, 2, false, null, null),
    ('Soft', 'Boissons sans alcool', 0.50, cat_boissons, 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg', true, 3, false, null, null),
    ('Thé à la menthe', 'Thé traditionnel marocain à la menthe fraîche', 2.50, cat_boissons, 'https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg', true, 4, false, null, null),
    
    -- EN CAS SALE
    ('Chips', 'Chips croustillantes', 0.50, cat_en_cas_sale, 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg', true, 1, false, null, null),
    ('Saucisson', 'Saucisson sec de qualité', 0.50, cat_en_cas_sale, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg', true, 2, false, null, null),
    
    -- EN CAS SUCRE
    ('Bonbons', 'Assortiment de bonbons', 0.50, cat_en_cas_sucre, 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true, 1, false, null, null),
    ('Chewing-gum', 'Chewing-gum parfum menthe', 0.50, cat_en_cas_sucre, 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true, 2, false, null, null),
    
    -- PLATS PRINCIPAUX
    ('Couscous royal', 'Couscous traditionnel avec merguez, agneau et légumes', 12.50, cat_plats_principaux, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg', true, 1, false, null, null),
    ('Tajine de poulet', 'Tajine de poulet aux olives et citrons confits', 11.00, cat_plats_principaux, 'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg', true, 2, false, null, null),
    ('Pastilla au poisson', 'Pastilla traditionnelle au poisson et aux épices', 9.50, cat_plats_principaux, 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg', true, 3, true, null, '[{"name": "Taille S", "quantity": 5}, {"name": "Taille M", "quantity": 3}, {"name": "Taille L", "quantity": 0}]'::jsonb),
    
    -- ENTREES
    ('Harira', 'Soupe traditionnelle marocaine aux lentilles', 4.50, cat_entrees, 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg', true, 1, true, 8, null),
    ('Salade marocaine', 'Salade fraîche aux tomates, concombres et herbes', 5.00, cat_entrees, 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg', true, 2, true, 2, null),
    
    -- DESSERTS
    ('Cornes de gazelle', 'Pâtisseries traditionnelles aux amandes', 6.00, cat_desserts, 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true, 1, true, 0, null),
    ('Chebakia', 'Pâtisseries au miel et graines de sésame', 5.50, cat_desserts, 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg', true, 2, false, null, null)
  ON CONFLICT DO NOTHING;
END $$;