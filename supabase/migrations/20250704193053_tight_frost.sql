/*
  # Fix RLS policies to prevent recursion

  1. Security Changes
    - Remove recursive policy references in profiles table
    - Simplify admin policies to avoid circular dependencies
    - Ensure policies don't reference the same table they're protecting

  2. Policy Updates
    - Rewrite admin policies to use auth.uid() directly
    - Remove EXISTS clauses that query profiles from profiles policies
    - Maintain security while preventing infinite loops
*/

-- Drop all existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new non-recursive policies for profiles
-- Simple policy: users can only see their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Simple policy: users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- For admin access, we'll use a different approach
-- Create a simple function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.email = 'adminpopotte@popotte.local'
  );
$$;

-- Admin policies using the function
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Fix other table policies that might reference profiles recursively
-- Update orders policies
DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (is_admin());

-- Update order_items policies
DROP POLICY IF EXISTS "Admins can read all order items" ON order_items;

CREATE POLICY "Admins can read all order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Update news policies
DROP POLICY IF EXISTS "Admins can manage all news" ON news;

CREATE POLICY "Admins can manage all news"
  ON news
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Update categories policies
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Update products policies
DROP POLICY IF EXISTS "Admins can manage products" ON products;

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (is_admin());