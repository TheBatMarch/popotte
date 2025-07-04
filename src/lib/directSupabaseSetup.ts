import { supabase } from './supabase'

export async function setupSupabaseDirectly() {
  console.log('🚀 Configuration directe de Supabase...')
  
  try {
    // 1. Créer la table profiles
    console.log('📝 Création de la table profiles...')
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email text UNIQUE NOT NULL,
          full_name text NOT NULL,
          username text UNIQUE NOT NULL,
          role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
        
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can read own profile" ON profiles
          FOR SELECT TO authenticated
          USING (auth.uid() = id);
          
        CREATE POLICY "Users can update own profile" ON profiles
          FOR UPDATE TO authenticated
          USING (auth.uid() = id);
      `
    })
    
    if (profilesError) {
      console.log('⚠️ Erreur profiles (peut-être déjà existante):', profilesError)
    }

    // 2. Créer la table categories
    console.log('📝 Création de la table categories...')
    const { error: categoriesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS categories (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          name text UNIQUE NOT NULL,
          slug text UNIQUE NOT NULL,
          display_order integer NOT NULL DEFAULT 0,
          created_at timestamptz DEFAULT now()
        );
        
        ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can read categories" ON categories
          FOR SELECT TO authenticated
          USING (true);
      `
    })
    
    if (categoriesError) {
      console.log('⚠️ Erreur categories:', categoriesError)
    }

    // 3. Insérer les catégories
    console.log('📦 Insertion des catégories...')
    const { error: insertCategoriesError } = await supabase
      .from('categories')
      .upsert([
        { name: 'BOISSONS', slug: 'boissons', display_order: 1 },
        { name: 'EN CAS SALE', slug: 'en-cas-sale', display_order: 2 },
        { name: 'EN CAS SUCRE', slug: 'en-cas-sucre', display_order: 3 },
        { name: 'PLATS PRINCIPAUX', slug: 'plats-principaux', display_order: 4 },
        { name: 'ENTREES', slug: 'entrees', display_order: 5 },
        { name: 'DESSERTS', slug: 'desserts', display_order: 6 }
      ], { onConflict: 'name' })

    if (insertCategoriesError) {
      console.log('⚠️ Erreur insertion catégories:', insertCategoriesError)
    }

    // 4. Créer la table products
    console.log('📝 Création de la table products...')
    const { error: productsError } = await supabase.rpc('exec_sql', {
      sql: `
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
        
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can read available products" ON products
          FOR SELECT TO authenticated
          USING (is_available = true);
      `
    })
    
    if (productsError) {
      console.log('⚠️ Erreur products:', productsError)
    }

    // 5. Récupérer les IDs des catégories pour les produits
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, slug')

    const categoryMap = categoriesData?.reduce((acc, cat) => {
      acc[cat.slug] = cat.id
      return acc
    }, {} as Record<string, string>) || {}

    // 6. Insérer les produits
    console.log('📦 Insertion des produits...')
    const { error: insertProductsError } = await supabase
      .from('products')
      .upsert([
        {
          name: 'Bières haut de gamme',
          description: 'Sélection de bières premium',
          price: 0.50,
          category_id: categoryMap['boissons'],
          image_url: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg',
          is_available: true,
          display_order: 1
        },
        {
          name: 'Soft',
          description: 'Boissons sans alcool',
          price: 0.50,
          category_id: categoryMap['boissons'],
          image_url: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
          is_available: true,
          display_order: 2
        },
        {
          name: 'Couscous royal',
          description: 'Couscous traditionnel avec merguez, agneau et légumes',
          price: 12.50,
          category_id: categoryMap['plats-principaux'],
          image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
          is_available: true,
          display_order: 1
        },
        {
          name: 'Tajine de poulet',
          description: 'Tajine de poulet aux olives et citrons confits',
          price: 11.00,
          category_id: categoryMap['plats-principaux'],
          image_url: 'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg',
          is_available: true,
          display_order: 2
        },
        {
          name: 'Harira',
          description: 'Soupe traditionnelle marocaine aux lentilles',
          price: 4.50,
          category_id: categoryMap['entrees'],
          image_url: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg',
          is_available: true,
          display_order: 1,
          stock_enabled: true,
          stock_quantity: 8
        }
      ], { onConflict: 'name' })

    if (insertProductsError) {
      console.log('⚠️ Erreur insertion produits:', insertProductsError)
    }

    // 7. Créer la table news
    console.log('📝 Création de la table news...')
    const { error: newsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS news (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          title text NOT NULL,
          content text NOT NULL,
          excerpt text,
          image_url text,
          author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
          published boolean DEFAULT false,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
        
        ALTER TABLE news ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Anyone can read published news" ON news
          FOR SELECT TO authenticated
          USING (published = true);
      `
    })
    
    if (newsError) {
      console.log('⚠️ Erreur news:', newsError)
    }

    // 8. Insérer les actualités
    console.log('📦 Insertion des actualités...')
    const { error: insertNewsError } = await supabase
      .from('news')
      .upsert([
        {
          title: 'Bienvenue à la Popotte Association !',
          content: `Nous sommes ravis de vous accueillir dans notre nouvelle application de commande en ligne.

Vous pouvez désormais :
- Consulter notre menu complet
- Passer vos commandes facilement
- Suivre vos dettes et paiements
- Rester informés de nos actualités

Notre association continue de vous proposer des plats traditionnels marocains préparés avec amour et des ingrédients de qualité.`,
          excerpt: 'Découvrez notre nouvelle application de commande en ligne',
          image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg',
          published: true
        },
        {
          title: 'Nouveau menu de printemps',
          content: `Nous avons le plaisir de vous annoncer l'arrivée de notre nouveau menu de printemps !

Au programme :
- Des salades fraîches de saison
- De nouveaux tajines aux légumes printaniers
- Des desserts légers et parfumés

Venez découvrir ces nouvelles saveurs dès maintenant !`,
          excerpt: 'Découvrez nos nouveaux plats de saison',
          image_url: 'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg',
          published: true
        }
      ], { onConflict: 'title' })

    if (insertNewsError) {
      console.log('⚠️ Erreur insertion news:', insertNewsError)
    }

    // 9. Créer les tables orders et order_items
    console.log('📝 Création des tables orders et order_items...')
    const { error: ordersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS orders (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          total_amount decimal(10,2) NOT NULL,
          status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'payment_notified', 'confirmed', 'cancelled')),
          payment_initiated_at timestamptz,
          payment_notified_at timestamptz,
          confirmed_at timestamptz,
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );
        
        CREATE TABLE IF NOT EXISTS order_items (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
          product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
          quantity integer NOT NULL CHECK (quantity > 0),
          unit_price decimal(10,2) NOT NULL,
          total_price decimal(10,2) NOT NULL,
          variant text,
          created_at timestamptz DEFAULT now()
        );
        
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
        ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can read own orders" ON orders
          FOR SELECT TO authenticated
          USING (user_id = auth.uid());
          
        CREATE POLICY "Users can create own orders" ON orders
          FOR INSERT TO authenticated
          WITH CHECK (user_id = auth.uid());
          
        CREATE POLICY "Users can read own order items" ON order_items
          FOR SELECT TO authenticated
          USING (EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
          ));
          
        CREATE POLICY "Users can create own order items" ON order_items
          FOR INSERT TO authenticated
          WITH CHECK (EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
          ));
      `
    })
    
    if (ordersError) {
      console.log('⚠️ Erreur orders:', ordersError)
    }

    // 10. Créer la fonction de gestion des nouveaux utilisateurs
    console.log('📝 Création de la fonction handle_new_user...')
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION handle_new_user()
        RETURNS trigger AS $$
        BEGIN
          INSERT INTO profiles (id, email, full_name, username, role)
          VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
            COALESCE(NEW.raw_user_meta_data->>'role', 'user')
          )
          ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            username = EXCLUDED.username,
            role = EXCLUDED.role,
            updated_at = now();
            
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION handle_new_user();
      `
    })
    
    if (functionError) {
      console.log('⚠️ Erreur fonction:', functionError)
    }

    console.log('✅ Configuration Supabase terminée !')
    
    // Vérifier le contenu
    const { data: categoriesCheck } = await supabase.from('categories').select('*')
    const { data: productsCheck } = await supabase.from('products').select('*')
    const { data: newsCheck } = await supabase.from('news').select('*')
    
    console.log('📊 Vérification du contenu :')
    console.log(`- Catégories : ${categoriesCheck?.length || 0}`)
    console.log(`- Produits : ${productsCheck?.length || 0}`)
    console.log(`- Actualités : ${newsCheck?.length || 0}`)
    
    return {
      success: true,
      categories: categoriesCheck?.length || 0,
      products: productsCheck?.length || 0,
      news: newsCheck?.length || 0
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration :', error)
    return { success: false, error }
  }
}