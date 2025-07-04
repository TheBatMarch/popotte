/*
  # Create categories table

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `display_order` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `categories` table
    - Add policy for authenticated users to read categories
    - Add policy for admins to manage categories

  3. Sample Data
    - Insert initial categories
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert sample categories
INSERT INTO categories (name, slug, display_order) VALUES
  ('BOISSONS', 'boissons', 1),
  ('EN CAS SALE', 'en-cas-sale', 2),
  ('EN CAS SUCRE', 'en-cas-sucre', 3),
  ('PLATS PRINCIPAUX', 'plats-principaux', 4),
  ('ENTREES', 'entrees', 5),
  ('DESSERTS', 'desserts', 6)
ON CONFLICT (name) DO NOTHING;