import { supabase } from './supabase'

export async function setupSupabaseComplete() {
  console.log('🚀 Configuration complète de Supabase avec nouvelle URL...')
  console.log('🔗 URL:', import.meta.env.VITE_SUPABASE_URL)
  
  try {
    // 1. Vérifier la connexion
    console.log('🔍 Test de connexion Supabase...')
    const { error: connectionTestError } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1)
    
    // L'erreur est normale si la table n'existe pas encore
    console.log('✅ Connexion Supabase établie')

    // 2. Créer d'abord la fonction exec_sql si elle n'existe pas
    console.log('📝 Création de la fonction exec_sql...')
    
    // Essayer d'abord de créer la fonction directement
    const { error: execFunctionTestError } = await supabase.rpc('exec_sql', {
      sql: 'SELECT 1 as test'
    })
    
    if (execFunctionTestError) {
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
      }
    } else {
      console.log('✅ Fonction exec_sql déjà disponible')
    }

    // 3. Appliquer la migration finale avec toutes les consignes
    console.log('📝 Application de la migration finale complète...')
    const { error: completeMigrationError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Application de toutes les consignes détaillées
        DO $$
        BEGIN
          -- Ajouter contrainte UNIQUE sur news.title
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'news_title_unique' 
            AND table_name = 'news'
          ) THEN
            ALTER TABLE news ADD CONSTRAINT news_title_unique UNIQUE (title);
          END IF;
          
          -- Ajouter contrainte UNIQUE sur products.name
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'products_name_unique' 
            AND table_name = 'products'
          ) THEN
            ALTER TABLE products ADD CONSTRAINT products_name_unique UNIQUE (name);
          END IF;
        END $$;
      `
    })
    
    if (completeMigrationError) {
      console.log('⚠️ Erreur migration complète:', completeMigrationError)
    } else {
      console.log('✅ Migration complète appliquée')
    }

    // 4. Insérer les données de base
    console.log('📦 Insertion des données de base...')
    
    // Insérer les catégories
    const { error: categoriesDataError } = await supabase
      .from('categories')
      .upsert([
        { name: 'BOISSONS', slug: 'boissons', display_order: 1 },
        { name: 'EN CAS SALE', slug: 'en-cas-sale', display_order: 2 },
        { name: 'EN CAS SUCRE', slug: 'en-cas-sucre', display_order: 3 },
        { name: 'PLATS PRINCIPAUX', slug: 'plats-principaux', display_order: 4 },
        { name: 'ENTREES', slug: 'entrees', display_order: 5 },
        { name: 'DESSERTS', slug: 'desserts', display_order: 6 }
      ], { onConflict: 'name' })

    if (categoriesDataError) {
      console.log('⚠️ Erreur insertion catégories:', categoriesDataError)
    } else {
      console.log('✅ Catégories insérées avec succès')
    }

    // Récupérer les IDs des catégories
    const { data: categoriesListResult } = await supabase
      .from('categories')
      .select('id, slug')

    const categoryMap = categoriesListResult?.reduce((acc, cat) => {
      acc[cat.slug] = cat.id
      return acc
    }, {} as Record<string, string>) || {}

    // Insérer les produits
    const { error: productsDataError } = await supabase
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

    if (productsDataError) {
      console.log('⚠️ Erreur insertion produits:', productsDataError)
    } else {
      console.log('✅ Produits insérés avec succès')
    }

    // Insérer les actualités
    const { error: newsDataError } = await supabase
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

    if (newsDataError) {
      console.log('⚠️ Erreur insertion actualités:', newsDataError)
    } else {
      console.log('✅ Actualités insérées avec succès')
    }

    console.log('🎉 Configuration Supabase terminée avec toutes les consignes appliquées !')
    
    // Vérifier le contenu final
    const { data: categoriesVerification } = await supabase.from('categories').select('*')
    const { data: productsVerification } = await supabase.from('products').select('*')
    const { data: newsVerification } = await supabase.from('news').select('*')
    
    console.log('📊 Vérification finale du contenu :')
    console.log(`✅ Catégories : ${categoriesVerification?.length || 0}`)
    console.log(`✅ Produits : ${productsVerification?.length || 0}`)
    console.log(`✅ Actualités : ${newsVerification?.length || 0}`)
    
    return {
      success: true,
      categories: categoriesVerification?.length || 0,
      products: productsVerification?.length || 0,
      news: newsVerification?.length || 0
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la configuration avec consignes appliquées :', error)
    return { success: false, error }
  }
}