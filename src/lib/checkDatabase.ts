import { supabase } from './supabase'

export async function checkDatabaseContent() {
  console.log('🔍 Vérification du contenu de la base de données Supabase...')
  
  try {
    // Vérifier la connexion
    const { data: { user } } = await supabase.auth.getUser()
    console.log('👤 Utilisateur connecté:', user?.email || 'Aucun')

    // Vérifier les catégories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('display_order')

    if (categoriesError) {
      console.error('❌ Erreur catégories:', categoriesError)
    } else {
      console.log('📂 Catégories trouvées:', categories?.length || 0)
      categories?.forEach(cat => {
        console.log(`  - ${cat.name} (${cat.slug})`)
      })
    }

    // Vérifier les produits
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        *,
        categories (
          name
        )
      `)
      .order('name')

    if (productsError) {
      console.error('❌ Erreur produits:', productsError)
    } else {
      console.log('🍽️ Produits trouvés:', products?.length || 0)
      products?.slice(0, 5).forEach(prod => {
        console.log(`  - ${prod.name} (${prod.price}€) - ${prod.categories?.name || 'Sans catégorie'}`)
      })
      if (products && products.length > 5) {
        console.log(`  ... et ${products.length - 5} autres produits`)
      }
    }

    // Vérifier les actualités
    const { data: news, error: newsError } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })

    if (newsError) {
      console.error('❌ Erreur actualités:', newsError)
    } else {
      console.log('📰 Actualités trouvées:', news?.length || 0)
      news?.forEach(article => {
        console.log(`  - ${article.title} (${article.published ? 'Publié' : 'Brouillon'})`)
      })
    }

    // Vérifier les utilisateurs (profiles)
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('❌ Erreur profils:', profilesError)
    } else {
      console.log('👥 Profils trouvés:', profiles?.length || 0)
      profiles?.forEach(profile => {
        console.log(`  - ${profile.full_name} (${profile.email}) - ${profile.role}`)
      })
    }

    // Vérifier les commandes
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (
          full_name,
          email
        ),
        order_items (
          *,
          products (
            name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('❌ Erreur commandes:', ordersError)
    } else {
      console.log('🛒 Commandes trouvées:', orders?.length || 0)
      orders?.forEach(order => {
        console.log(`  - Commande ${order.id.slice(0, 8)}... (${order.total_amount}€) - ${order.status}`)
      })
    }

    // Résumé
    const summary = {
      categories: categories?.length || 0,
      products: products?.length || 0,
      news: news?.length || 0,
      profiles: profiles?.length || 0,
      orders: orders?.length || 0,
      connection: !!user
    }

    console.log('📊 RÉSUMÉ DE LA BASE DE DONNÉES:')
    console.log('================================')
    console.log(`🔗 Connexion Supabase: ${summary.connection ? '✅ OK' : '❌ ÉCHEC'}`)
    console.log(`📂 Catégories: ${summary.categories}`)
    console.log(`🍽️ Produits: ${summary.products}`)
    console.log(`📰 Actualités: ${summary.news}`)
    console.log(`👥 Utilisateurs: ${summary.profiles}`)
    console.log(`🛒 Commandes: ${summary.orders}`)

    if (summary.categories === 0 && summary.products === 0 && summary.news === 0) {
      console.log('⚠️ LA BASE DE DONNÉES EST VIDE!')
      console.log('💡 Exécutez initializeDatabase() pour la remplir')
    } else {
      console.log('✅ La base de données contient du contenu')
    }

    return summary

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error)
    return {
      categories: 0,
      products: 0,
      news: 0,
      profiles: 0,
      orders: 0,
      connection: false,
      error: error
    }
  }
}

// Fonction pour afficher les détails d'une table spécifique
export async function checkTableDetails(tableName: string) {
  console.log(`🔍 Détails de la table "${tableName}":`)
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(10)

    if (error) {
      console.error(`❌ Erreur table ${tableName}:`, error)
      return null
    }

    console.log(`📊 Nombre d'enregistrements: ${data?.length || 0}`)
    if (data && data.length > 0) {
      console.log('📝 Premier enregistrement:')
      console.log(JSON.stringify(data[0], null, 2))
    }

    return data

  } catch (error) {
    console.error(`❌ Erreur lors de la vérification de ${tableName}:`, error)
    return null
  }
}