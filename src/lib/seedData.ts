import { supabase } from './supabase'

export async function seedDatabase() {
  try {
    console.log('🌱 Début du peuplement de la base de données...')

    // Vérifier si les données existent déjà
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id')
      .limit(1)

    if (existingCategories && existingCategories.length > 0) {
      console.log('✅ Les données existent déjà dans Supabase')
      return
    }

    console.log('📝 Insertion des catégories...')
    // Insérer les catégories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .insert([
        { name: 'BOISSONS', slug: 'boissons', display_order: 1 },
        { name: 'EN CAS SALE', slug: 'en-cas-sale', display_order: 2 },
        { name: 'EN CAS SUCRE', slug: 'en-cas-sucre', display_order: 3 },
        { name: 'PLATS PRINCIPAUX', slug: 'plats-principaux', display_order: 4 },
        { name: 'ENTREES', slug: 'entrees', display_order: 5 },
        { name: 'DESSERTS', slug: 'desserts', display_order: 6 }
      ])
      .select()

    if (categoriesError) {
      console.error('❌ Erreur lors de l\'insertion des catégories:', categoriesError)
      throw categoriesError
    }

    console.log('✅ Catégories insérées:', categories?.length)

    // Récupérer les IDs des catégories
    const { data: allCategories } = await supabase
      .from('categories')
      .select('id, slug')

    const categoryMap = allCategories?.reduce((acc, cat) => {
      acc[cat.slug] = cat.id
      return acc
    }, {} as Record<string, string>) || {}

    console.log('📦 Insertion des produits...')
    // Insérer les produits
    const { data: products, error: productsError } = await supabase
      .from('products')
      .insert([
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
      ])
      .select()

    if (productsError) {
      console.error('❌ Erreur lors de l\'insertion des produits:', productsError)
      throw productsError
    }

    console.log('✅ Produits insérés:', products?.length)

    console.log('📰 Insertion des actualités...')
    // Insérer les actualités
    const { data: news, error: newsError } = await supabase
      .from('news')
      .insert([
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
      ])
      .select()

    if (newsError) {
      console.error('❌ Erreur lors de l\'insertion des actualités:', newsError)
      throw newsError
    }

    console.log('✅ Actualités insérées:', news?.length)
    console.log('🎉 Base de données peuplée avec succès !')

    return {
      categories: categories?.length || 0,
      products: products?.length || 0,
      news: news?.length || 0
    }

  } catch (error) {
    console.error('❌ Erreur lors du peuplement de la base de données:', error)
    throw error
  }
}