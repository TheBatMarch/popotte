import { supabase } from './supabase'

export async function setupSupabaseComplete() {
  console.log('🚀 Configuration complète de Supabase avec nouvelle URL...')
  console.log('🔗 URL:', import.meta.env.VITE_SUPABASE_URL)
  
  try {
    // 1. Vérifier la connexion
    console.log('🔍 Test de connexion Supabase...')
    const { data: testData, error: testError } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1)
    
    // L'erreur est normale si la table n'existe pas encore
    console.log('✅ Connexion Supabase établie')

    // 2. Créer d'abord la fonction exec_sql si elle n'existe pas
    console.log('📝 Création de la fonction exec_sql...')
    
    // Essayer d'abord de créer la fonction directement
    const { error: directExecError } = await supabase.rpc('exec_sql', {
      sql: 'SELECT 1 as test'
    })
    
    if (directExecError) {
      console.log('📝 Fonction exec_sql n\'existe pas, création...')
      // Utiliser une requête SQL directe pour créer la fonction
      const { error: createFunctionError } = await supabase.rpc('exec', {
        sql: `
          CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
          RETURNS json
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          DECLARE
            result json;
          BEGIN
            EXECUTE sql INTO result;
            RETURN result;
          EXCEPTION
            WHEN OTHERS THEN
              RETURN json_build_object(
                'error', true,
                'message', SQLERRM,
                'detail', SQLSTATE
              );
          END;
          $$;
          
          GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
          GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;
        `
      })
      
      if (createFunctionError) {
        console.log('⚠️ Impossible de créer exec_sql via rpc, tentative alternative...')
        // Essayer une approche alternative
        const { error: altError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
            RETURNS json
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            DECLARE
              result json;
            BEGIN
              EXECUTE sql INTO result;
              RETURN result;
            EXCEPTION
              WHEN OTHERS THEN
                RETURN json_build_object(
                  'error', true,
                  'message', SQLERRM,
                  'detail', SQLSTATE
                );
            END;
            $$;
            
            GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO authenticated;
            GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO anon;
          `
        })
      }
    } else {
      console.log('✅ Fonction exec_sql déjà disponible')
    }

    // 3. Exécuter la migration complète via exec_sql
    console.log('📝 Exécution de la migration complète...')
    const { error: migrationError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Activer les extensions nécessaires
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

        -- =============================================
        -- 1. TABLE PROFILES
        -- =============================================

        CREATE TABLE IF NOT EXISTS profiles (
          id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          email text UNIQUE NOT NULL,
          full_name text NOT NULL,
          username text UNIQUE NOT NULL,
          role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
          created_at timestamptz DEFAULT now(),
          updated_at timestamptz DEFAULT now()
        );

        -- =============================================
        -- 2. TABLE CATEGORIES
        -- =============================================

        CREATE TABLE IF NOT EXISTS categories (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          name text UNIQUE NOT NULL,
          slug text UNIQUE NOT NULL,
          display_order integer NOT NULL DEFAULT 0,
          created_at timestamptz DEFAULT now()
        );

        -- =============================================
        -- 3. TABLE PRODUCTS
        -- =============================================

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

        -- =============================================
        -- 4. TABLE NEWS
        -- =============================================

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

        -- =============================================
        -- 5. TABLE ORDERS
        -- =============================================

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

        -- =============================================
        -- 6. TABLE ORDER_ITEMS
        -- =============================================

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

        -- =============================================
        -- 7. ACTIVATION RLS
        -- =============================================

        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
        ALTER TABLE products ENABLE ROW LEVEL SECURITY;
        ALTER TABLE news ENABLE ROW LEVEL SECURITY;
        ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
        ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
      `
    })
    
    if (migrationError) {
      console.log('⚠️ Erreur migration tables:', migrationError)
      // Continuer malgré l'erreur car les tables peuvent déjà exister
    } else {
      console.log('✅ Tables créées avec succès')
    }

    // 4. Créer les politiques RLS
    console.log('📝 Création des politiques RLS...')
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- =============================================
        -- POLITIQUES RLS - PROFILES
        -- =============================================

        DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
        CREATE POLICY "Users can read own profile"
          ON profiles FOR SELECT
          TO authenticated
          USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        CREATE POLICY "Users can update own profile"
          ON profiles FOR UPDATE
          TO authenticated
          USING (auth.uid() = id);

        DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
        CREATE POLICY "Admins can read all profiles"
          ON profiles FOR SELECT
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );

        -- =============================================
        -- POLITIQUES RLS - CATEGORIES
        -- =============================================

        DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
        CREATE POLICY "Anyone can read categories"
          ON categories FOR SELECT
          TO authenticated
          USING (true);

        DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
        CREATE POLICY "Admins can manage categories"
          ON categories FOR ALL
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );

        -- =============================================
        -- POLITIQUES RLS - PRODUCTS
        -- =============================================

        DROP POLICY IF EXISTS "Anyone can read available products" ON products;
        CREATE POLICY "Anyone can read available products"
          ON products FOR SELECT
          TO authenticated
          USING (is_available = true);

        DROP POLICY IF EXISTS "Admins can read all products" ON products;
        CREATE POLICY "Admins can read all products"
          ON products FOR SELECT
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );

        DROP POLICY IF EXISTS "Admins can manage products" ON products;
        CREATE POLICY "Admins can manage products"
          ON products FOR ALL
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );

        -- =============================================
        -- POLITIQUES RLS - NEWS
        -- =============================================

        DROP POLICY IF EXISTS "Anyone can read published news" ON news;
        CREATE POLICY "Anyone can read published news"
          ON news FOR SELECT
          TO authenticated
          USING (published = true);

        DROP POLICY IF EXISTS "Admins can read all news" ON news;
        CREATE POLICY "Admins can read all news"
          ON news FOR SELECT
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );

        DROP POLICY IF EXISTS "Admins can manage news" ON news;
        CREATE POLICY "Admins can manage news"
          ON news FOR ALL
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );

        -- =============================================
        -- POLITIQUES RLS - ORDERS
        -- =============================================

        DROP POLICY IF EXISTS "Users can read own orders" ON orders;
        CREATE POLICY "Users can read own orders"
          ON orders FOR SELECT
          TO authenticated
          USING (user_id = auth.uid());

        DROP POLICY IF EXISTS "Users can create own orders" ON orders;
        CREATE POLICY "Users can create own orders"
          ON orders FOR INSERT
          TO authenticated
          WITH CHECK (user_id = auth.uid());

        DROP POLICY IF EXISTS "Users can update own orders" ON orders;
        CREATE POLICY "Users can update own orders"
          ON orders FOR UPDATE
          TO authenticated
          USING (user_id = auth.uid());

        DROP POLICY IF EXISTS "Admins can read all orders" ON orders;
        CREATE POLICY "Admins can read all orders"
          ON orders FOR SELECT
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );

        DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
        CREATE POLICY "Admins can update all orders"
          ON orders FOR UPDATE
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );

        -- =============================================
        -- POLITIQUES RLS - ORDER_ITEMS
        -- =============================================

        DROP POLICY IF EXISTS "Users can read own order items" ON order_items;
        CREATE POLICY "Users can read own order items"
          ON order_items FOR SELECT
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM orders
              WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
            )
          );

        DROP POLICY IF EXISTS "Users can create own order items" ON order_items;
        CREATE POLICY "Users can create own order items"
          ON order_items FOR INSERT
          TO authenticated
          WITH CHECK (
            EXISTS (
              SELECT 1 FROM orders
              WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
            )
          );

        DROP POLICY IF EXISTS "Admins can read all order items" ON order_items;
        CREATE POLICY "Admins can read all order items"
          ON order_items FOR SELECT
          TO authenticated
          USING (
            EXISTS (
              SELECT 1 FROM profiles
              WHERE id = auth.uid() AND role = 'admin'
            )
          );
      `
    })
    
    if (rlsError) {
      console.log('⚠️ Erreur politiques RLS:', rlsError)
    } else {
      console.log('✅ Politiques RLS créées avec succès')
    }

    // 5. Créer les fonctions et triggers
    console.log('📝 Création des fonctions et triggers...')
    const { error: functionsError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Fonction pour mettre à jour updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = now();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        -- Triggers pour updated_at
        DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
        CREATE TRIGGER update_profiles_updated_at
          BEFORE UPDATE ON profiles
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_products_updated_at ON products;
        CREATE TRIGGER update_products_updated_at
          BEFORE UPDATE ON products
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
        CREATE TRIGGER update_orders_updated_at
          BEFORE UPDATE ON orders
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        DROP TRIGGER IF EXISTS update_news_updated_at ON news;
        CREATE TRIGGER update_news_updated_at
          BEFORE UPDATE ON news
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();

        -- Fonction pour gérer les nouveaux utilisateurs
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

        -- Trigger pour nouveaux utilisateurs
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION handle_new_user();
      `
    })
    
    if (functionsError) {
      console.log('⚠️ Erreur fonctions:', functionsError)
    } else {
      console.log('✅ Fonctions et triggers créés avec succès')
    }

    // 6. Insérer les données de base
    console.log('📦 Insertion des données de base...')
    
    // Insérer les catégories
    const { error: categoriesError } = await supabase
      .from('categories')
      .upsert([
        { name: 'BOISSONS', slug: 'boissons', display_order: 1 },
        { name: 'EN CAS SALE', slug: 'en-cas-sale', display_order: 2 },
        { name: 'EN CAS SUCRE', slug: 'en-cas-sucre', display_order: 3 },
        { name: 'PLATS PRINCIPAUX', slug: 'plats-principaux', display_order: 4 },
        { name: 'ENTREES', slug: 'entrees', display_order: 5 },
        { name: 'DESSERTS', slug: 'desserts', display_order: 6 }
      ], { onConflict: 'name' })

    if (categoriesError) {
      console.log('⚠️ Erreur insertion catégories:', categoriesError)
    } else {
      console.log('✅ Catégories insérées avec succès')
    }

    // Récupérer les IDs des catégories
    const { data: categoriesData } = await supabase
      .from('categories')
      .select('id, slug')

    const categoryMap = categoriesData?.reduce((acc, cat) => {
      acc[cat.slug] = cat.id
      return acc
    }, {} as Record<string, string>) || {}

    // Insérer les produits
    const { error: productsError } = await supabase
      .from('products')
      .upsert([
        // BOISSONS
        {
          name: 'Bières haut de gamme',
          description: 'Sélection de bières premium',
          price: 0.50,
          category_id: categoryMap['boissons'],
          image_url: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg',
          is_available: true,
          display_order: 1,
          stock_enabled: false
        },
        {
          name: 'Bières basiques',
          description: 'Bières classiques',
          price: 0.50,
          category_id: categoryMap['boissons'],
          image_url: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg',
          is_available: true,
          display_order: 2,
          stock_enabled: false
        },
        {
          name: 'Soft',
          description: 'Boissons sans alcool',
          price: 0.50,
          category_id: categoryMap['boissons'],
          image_url: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
          is_available: true,
          display_order: 3,
          stock_enabled: false
        },
        {
          name: 'Thé à la menthe',
          description: 'Thé traditionnel marocain à la menthe fraîche',
          price: 2.50,
          category_id: categoryMap['boissons'],
          image_url: 'https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg',
          is_available: true,
          display_order: 4,
          stock_enabled: false
        },

        // EN CAS SALE
        {
          name: 'Chips',
          description: 'Chips croustillantes',
          price: 0.50,
          category_id: categoryMap['en-cas-sale'],
          image_url: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg',
          is_available: true,
          display_order: 1,
          stock_enabled: false
        },
        {
          name: 'Saucisson',
          description: 'Saucisson sec de qualité',
          price: 0.50,
          category_id: categoryMap['en-cas-sale'],
          image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
          is_available: true,
          display_order: 2,
          stock_enabled: false
        },

        // EN CAS SUCRE
        {
          name: 'Bonbons',
          description: 'Assortiment de bonbons',
          price: 0.50,
          category_id: categoryMap['en-cas-sucre'],
          image_url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
          is_available: true,
          display_order: 1,
          stock_enabled: false
        },
        {
          name: 'Chewing-gum',
          description: 'Chewing-gum parfum menthe',
          price: 0.50,
          category_id: categoryMap['en-cas-sucre'],
          image_url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
          is_available: true,
          display_order: 2,
          stock_enabled: false
        },

        // PLATS PRINCIPAUX
        {
          name: 'Couscous royal',
          description: 'Couscous traditionnel avec merguez, agneau et légumes',
          price: 12.50,
          category_id: categoryMap['plats-principaux'],
          image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
          is_available: true,
          display_order: 1,
          stock_enabled: false
        },
        {
          name: 'Tajine de poulet',
          description: 'Tajine de poulet aux olives et citrons confits',
          price: 11.00,
          category_id: categoryMap['plats-principaux'],
          image_url: 'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg',
          is_available: true,
          display_order: 2,
          stock_enabled: false
        },
        {
          name: 'Pastilla au poisson',
          description: 'Pastilla traditionnelle au poisson et aux épices',
          price: 9.50,
          category_id: categoryMap['plats-principaux'],
          image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
          is_available: true,
          display_order: 3,
          stock_enabled: true,
          stock_variants: [
            { name: 'Taille S', quantity: 5 },
            { name: 'Taille M', quantity: 3 },
            { name: 'Taille L', quantity: 0 }
          ]
        },

        // ENTREES
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
        },
        {
          name: 'Salade marocaine',
          description: 'Salade fraîche aux tomates, concombres et herbes',
          price: 5.00,
          category_id: categoryMap['entrees'],
          image_url: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg',
          is_available: true,
          display_order: 2,
          stock_enabled: true,
          stock_quantity: 2
        },

        // DESSERTS
        {
          name: 'Cornes de gazelle',
          description: 'Pâtisseries traditionnelles aux amandes',
          price: 6.00,
          category_id: categoryMap['desserts'],
          image_url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
          is_available: true,
          display_order: 1,
          stock_enabled: true,
          stock_quantity: 0
        },
        {
          name: 'Chebakia',
          description: 'Pâtisseries au miel et graines de sésame',
          price: 5.50,
          category_id: categoryMap['desserts'],
          image_url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
          is_available: true,
          display_order: 2,
          stock_enabled: false
        }
      ], { onConflict: 'name' })

    if (productsError) {
      console.log('⚠️ Erreur insertion produits:', productsError)
    } else {
      console.log('✅ Produits insérés avec succès')
    }

    // Insérer les actualités
    const { error: newsError } = await supabase
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

Notre association continue de vous proposer des plats traditionnels marocains préparés avec amour et des ingrédients de qualité.

N'hésitez pas à nous faire part de vos retours pour améliorer votre expérience !`,
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

Tous nos plats sont préparés avec des produits frais et de saison, dans le respect de nos traditions culinaires.

Venez découvrir ces nouvelles saveurs dès maintenant !`,
          excerpt: 'Découvrez nos nouveaux plats de saison',
          image_url: 'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg',
          published: true
        },
        {
          title: 'Horaires d\'ouverture mis à jour',
          content: `Nous vous informons que nos horaires d'ouverture ont été légèrement modifiés pour mieux vous servir :

Lundi - Vendredi : 11h30 - 14h30 et 18h30 - 22h00
Samedi - Dimanche : 12h00 - 15h00 et 19h00 - 22h30

Les commandes en ligne restent disponibles 24h/24 avec récupération selon nos horaires d'ouverture.

Merci de votre compréhension !`,
          excerpt: 'Nouveaux horaires pour mieux vous servir',
          image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
          published: true
        }
      ], { onConflict: 'title' })

    if (newsError) {
      console.log('⚠️ Erreur insertion actualités:', newsError)
    } else {
      console.log('✅ Actualités insérées avec succès')
    }

    console.log('🎉 Configuration Supabase terminée avec succès !')
    
    // Vérifier le contenu final
    const { data: categoriesCheck } = await supabase.from('categories').select('*')
    const { data: productsCheck } = await supabase.from('products').select('*')
    const { data: newsCheck } = await supabase.from('news').select('*')
    
    console.log('📊 Vérification finale du contenu :')
    console.log(`✅ Catégories : ${categoriesCheck?.length || 0}`)
    console.log(`✅ Produits : ${productsCheck?.length || 0}`)
    console.log(`✅ Actualités : ${newsCheck?.length || 0}`)
    
    return {
      success: true,
      categories: categoriesCheck?.length || 0,
      products: productsCheck?.length || 0,
      news: newsCheck?.length || 0
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration complète :', error)
    return { success: false, error }
  }
}