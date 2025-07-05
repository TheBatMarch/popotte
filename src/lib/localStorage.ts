// Système de stockage local complet
export interface User {
  id: string
  email: string
  full_name: string
  username: string
  role: 'user' | 'admin'
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  display_order: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category_id: string | null
  image_url: string | null
  is_available: boolean
  display_order: number
  stock_enabled: boolean
  stock_quantity?: number
  stock_variants?: Array<{
    name: string
    quantity: number
  }>
  categories?: {
    name: string
  }
}

export interface NewsPost {
  id: string
  title: string
  content: string
  excerpt: string | null
  image_url: string | null
  published: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  total_amount: number
  status: 'pending' | 'payment_notified' | 'confirmed' | 'cancelled'
  payment_initiated_at: string | null
  payment_notified_at: string | null
  confirmed_at: string | null
  created_at: string
  order_items: OrderItem[]
  profiles?: {
    full_name: string
    email: string
  }
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  variant?: string
  products: {
    name: string
  }
}

// Clés de stockage
const STORAGE_KEYS = {
  USERS: 'popotte_users',
  CATEGORIES: 'popotte_categories',
  PRODUCTS: 'popotte_products',
  NEWS: 'popotte_news',
  ORDERS: 'popotte_orders',
  CURRENT_USER: 'popotte_current_user'
}

// Données par défaut
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'BOISSONS', slug: 'boissons', display_order: 1, created_at: new Date().toISOString() },
  { id: 'cat-2', name: 'EN CAS SALE', slug: 'en-cas-sale', display_order: 2, created_at: new Date().toISOString() },
  { id: 'cat-3', name: 'EN CAS SUCRE', slug: 'en-cas-sucre', display_order: 3, created_at: new Date().toISOString() },
  { id: 'cat-4', name: 'PLATS PRINCIPAUX', slug: 'plats-principaux', display_order: 4, created_at: new Date().toISOString() },
  { id: 'cat-5', name: 'ENTREES', slug: 'entrees', display_order: 5, created_at: new Date().toISOString() },
  { id: 'cat-6', name: 'DESSERTS', slug: 'desserts', display_order: 6, created_at: new Date().toISOString() }
]

const DEFAULT_PRODUCTS: Product[] = [
  // BOISSONS
  {
    id: 'prod-1',
    name: 'Bières haut de gamme',
    description: 'Sélection de bières premium',
    price: 0.50,
    category_id: 'cat-1',
    image_url: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg',
    is_available: true,
    display_order: 1,
    stock_enabled: false,
    categories: { name: 'BOISSONS' }
  },
  {
    id: 'prod-2',
    name: 'Bières basiques',
    description: 'Bières classiques',
    price: 0.50,
    category_id: 'cat-1',
    image_url: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg',
    is_available: true,
    display_order: 2,
    stock_enabled: false,
    categories: { name: 'BOISSONS' }
  },
  {
    id: 'prod-3',
    name: 'Soft',
    description: 'Boissons sans alcool',
    price: 0.50,
    category_id: 'cat-1',
    image_url: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
    is_available: true,
    display_order: 3,
    stock_enabled: false,
    categories: { name: 'BOISSONS' }
  },
  {
    id: 'prod-4',
    name: 'Thé à la menthe',
    description: 'Thé traditionnel marocain à la menthe fraîche',
    price: 2.50,
    category_id: 'cat-1',
    image_url: 'https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg',
    is_available: true,
    display_order: 4,
    stock_enabled: false,
    categories: { name: 'BOISSONS' }
  },
  {
    id: 'prod-5',
    name: 'Café marocain',
    description: 'Café traditionnel aux épices',
    price: 2.00,
    category_id: 'cat-1',
    image_url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg',
    is_available: true,
    display_order: 5,
    stock_enabled: false,
    categories: { name: 'BOISSONS' }
  },
  {
    id: 'prod-6',
    name: 'Jus d\'orange frais',
    description: 'Jus d\'orange pressé du jour',
    price: 3.00,
    category_id: 'cat-1',
    image_url: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
    is_available: true,
    display_order: 6,
    stock_enabled: false,
    categories: { name: 'BOISSONS' }
  },

  // EN CAS SALE
  {
    id: 'prod-7',
    name: 'Chips',
    description: 'Chips croustillantes',
    price: 0.50,
    category_id: 'cat-2',
    image_url: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg',
    is_available: true,
    display_order: 1,
    stock_enabled: false,
    categories: { name: 'EN CAS SALE' }
  },
  {
    id: 'prod-8',
    name: 'Saucisson',
    description: 'Saucisson sec de qualité',
    price: 0.50,
    category_id: 'cat-2',
    image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    is_available: true,
    display_order: 2,
    stock_enabled: false,
    categories: { name: 'EN CAS SALE' }
  },
  {
    id: 'prod-9',
    name: 'Olives marinées',
    description: 'Olives vertes et noires marinées aux herbes',
    price: 3.50,
    category_id: 'cat-2',
    image_url: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg',
    is_available: true,
    display_order: 3,
    stock_enabled: false,
    categories: { name: 'EN CAS SALE' }
  },
  {
    id: 'prod-10',
    name: 'Fromage de chèvre',
    description: 'Fromage de chèvre frais aux herbes',
    price: 4.00,
    category_id: 'cat-2',
    image_url: 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg',
    is_available: true,
    display_order: 4,
    stock_enabled: false,
    categories: { name: 'EN CAS SALE' }
  },

  // EN CAS SUCRE
  {
    id: 'prod-11',
    name: 'Bonbons',
    description: 'Assortiment de bonbons',
    price: 0.50,
    category_id: 'cat-3',
    image_url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
    is_available: true,
    display_order: 1,
    stock_enabled: false,
    categories: { name: 'EN CAS SUCRE' }
  },
  {
    id: 'prod-12',
    name: 'Chewing-gum',
    description: 'Chewing-gum parfum menthe',
    price: 0.50,
    category_id: 'cat-3',
    image_url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
    is_available: true,
    display_order: 2,
    stock_enabled: false,
    categories: { name: 'EN CAS SUCRE' }
  },
  {
    id: 'prod-13',
    name: 'Dattes Medjool',
    description: 'Dattes fraîches de qualité premium',
    price: 5.00,
    category_id: 'cat-3',
    image_url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
    is_available: true,
    display_order: 3,
    stock_enabled: false,
    categories: { name: 'EN CAS SUCRE' }
  },
  {
    id: 'prod-14',
    name: 'Miel d\'acacia',
    description: 'Miel pur d\'acacia du Maroc',
    price: 8.00,
    category_id: 'cat-3',
    image_url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
    is_available: true,
    display_order: 4,
    stock_enabled: false,
    categories: { name: 'EN CAS SUCRE' }
  },

  // PLATS PRINCIPAUX
  {
    id: 'prod-15',
    name: 'Couscous royal',
    description: 'Couscous traditionnel avec merguez, agneau et légumes',
    price: 12.50,
    category_id: 'cat-4',
    image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    is_available: true,
    display_order: 1,
    stock_enabled: false,
    categories: { name: 'PLATS PRINCIPAUX' }
  },
  {
    id: 'prod-16',
    name: 'Tajine de poulet',
    description: 'Tajine de poulet aux olives et citrons confits',
    price: 11.00,
    category_id: 'cat-4',
    image_url: 'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg',
    is_available: true,
    display_order: 2,
    stock_enabled: false,
    categories: { name: 'PLATS PRINCIPAUX' }
  },
  {
    id: 'prod-17',
    name: 'Pastilla au poisson',
    description: 'Pastilla traditionnelle au poisson et aux épices',
    price: 9.50,
    category_id: 'cat-4',
    image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    is_available: true,
    display_order: 3,
    stock_enabled: true,
    stock_variants: [
      { name: 'Taille S', quantity: 5 },
      { name: 'Taille M', quantity: 3 },
      { name: 'Taille L', quantity: 0 }
    ],
    categories: { name: 'PLATS PRINCIPAUX' }
  },
  {
    id: 'prod-18',
    name: 'Tajine d\'agneau',
    description: 'Tajine d\'agneau aux pruneaux et amandes',
    price: 13.50,
    category_id: 'cat-4',
    image_url: 'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg',
    is_available: true,
    display_order: 4,
    stock_enabled: false,
    categories: { name: 'PLATS PRINCIPAUX' }
  },
  {
    id: 'prod-19',
    name: 'Couscous aux légumes',
    description: 'Couscous végétarien aux légumes de saison',
    price: 10.00,
    category_id: 'cat-4',
    image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    is_available: true,
    display_order: 5,
    stock_enabled: false,
    categories: { name: 'PLATS PRINCIPAUX' }
  },
  {
    id: 'prod-20',
    name: 'Kefta aux œufs',
    description: 'Boulettes de viande épicées aux œufs et tomates',
    price: 9.00,
    category_id: 'cat-4',
    image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    is_available: true,
    display_order: 6,
    stock_enabled: false,
    categories: { name: 'PLATS PRINCIPAUX' }
  },

  // ENTREES
  {
    id: 'prod-21',
    name: 'Harira',
    description: 'Soupe traditionnelle marocaine aux lentilles',
    price: 4.50,
    category_id: 'cat-5',
    image_url: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg',
    is_available: true,
    display_order: 1,
    stock_enabled: true,
    stock_quantity: 8,
    categories: { name: 'ENTREES' }
  },
  {
    id: 'prod-22',
    name: 'Salade marocaine',
    description: 'Salade fraîche aux tomates, concombres et herbes',
    price: 5.00,
    category_id: 'cat-5',
    image_url: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg',
    is_available: true,
    display_order: 2,
    stock_enabled: true,
    stock_quantity: 2,
    categories: { name: 'ENTREES' }
  },
  {
    id: 'prod-23',
    name: 'Zaalouk',
    description: 'Caviar d\'aubergines aux tomates et épices',
    price: 4.00,
    category_id: 'cat-5',
    image_url: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg',
    is_available: true,
    display_order: 3,
    stock_enabled: false,
    categories: { name: 'ENTREES' }
  },
  {
    id: 'prod-24',
    name: 'Briouates au fromage',
    description: 'Petits feuilletés croustillants au fromage',
    price: 6.00,
    category_id: 'cat-5',
    image_url: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg',
    is_available: true,
    display_order: 4,
    stock_enabled: false,
    categories: { name: 'ENTREES' }
  },
  {
    id: 'prod-25',
    name: 'Chorba',
    description: 'Soupe de légumes traditionnelle',
    price: 3.50,
    category_id: 'cat-5',
    image_url: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg',
    is_available: true,
    display_order: 5,
    stock_enabled: false,
    categories: { name: 'ENTREES' }
  },

  // DESSERTS
  {
    id: 'prod-26',
    name: 'Cornes de gazelle',
    description: 'Pâtisseries traditionnelles aux amandes',
    price: 6.00,
    category_id: 'cat-6',
    image_url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
    is_available: true,
    display_order: 1,
    stock_enabled: true,
    stock_quantity: 0,
    categories: { name: 'DESSERTS' }
  },
  {
    id: 'prod-27',
    name: 'Chebakia',
    description: 'Pâtisseries au miel et graines de sésame',
    price: 5.50,
    category_id: 'cat-6',
    image_url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
    is_available: true,
    display_order: 2,
    stock_enabled: false,
    categories: { name: 'DESSERTS' }
  },
  {
    id: 'prod-28',
    name: 'Makroudh',
    description: 'Gâteaux de semoule aux dattes',
    price: 4.50,
    category_id: 'cat-6',
    image_url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
    is_available: true,
    display_order: 3,
    stock_enabled: false,
    categories: { name: 'DESSERTS' }
  },
  {
    id: 'prod-29',
    name: 'Baklava',
    description: 'Pâtisseries feuilletées au miel et pistaches',
    price: 7.00,
    category_id: 'cat-6',
    image_url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
    is_available: true,
    display_order: 4,
    stock_enabled: false,
    categories: { name: 'DESSERTS' }
  },
  {
    id: 'prod-30',
    name: 'Mouhallabia',
    description: 'Crème dessert à la fleur d\'oranger',
    price: 3.50,
    category_id: 'cat-6',
    image_url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
    is_available: true,
    display_order: 5,
    stock_enabled: false,
    categories: { name: 'DESSERTS' }
  }
]

const DEFAULT_NEWS: NewsPost[] = [
  {
    id: 'news-1',
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
    published: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'news-2',
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
    published: true,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'news-3',
    title: 'Horaires d\'ouverture mis à jour',
    content: `Nous vous informons que nos horaires d'ouverture ont été légèrement modifiés pour mieux vous servir :

Lundi - Vendredi : 11h30 - 14h30 et 18h30 - 22h00
Samedi - Dimanche : 12h00 - 15h00 et 19h00 - 22h30

Les commandes en ligne restent disponibles 24h/24 avec récupération selon nos horaires d'ouverture.

Merci de votre compréhension !`,
    excerpt: 'Nouveaux horaires pour mieux vous servir',
    image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    published: true,
    created_at: new Date(Date.now() - 172800000).toISOString()
  }
]

const DEFAULT_USERS: User[] = [
  {
    id: 'user-1',
    email: 'admin@popotte.fr',
    full_name: 'Administrateur Popotte',
    username: 'admin',
    role: 'admin',
    created_at: new Date().toISOString()
  }
]

// Classe de gestion du stockage local
class LocalStorage {
  // Initialisation des données par défaut
  initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES))
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(DEFAULT_PRODUCTS))
    }
    if (!localStorage.getItem(STORAGE_KEYS.NEWS)) {
      localStorage.setItem(STORAGE_KEYS.NEWS, JSON.stringify(DEFAULT_NEWS))
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS))
    }
    if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify([]))
    }
  }

  // Méthodes génériques
  private get<T>(key: string): T[] {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  private set<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data))
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9)
  }

  // CATEGORIES
  getCategories(): Category[] {
    return this.get<Category>(STORAGE_KEYS.CATEGORIES)
      .sort((a, b) => a.display_order - b.display_order)
  }

  createCategory(data: Omit<Category, 'id' | 'created_at'>): Category {
    const categories = this.get<Category>(STORAGE_KEYS.CATEGORIES)
    const newCategory: Category = {
      ...data,
      id: this.generateId(),
      created_at: new Date().toISOString()
    }
    categories.push(newCategory)
    this.set(STORAGE_KEYS.CATEGORIES, categories)
    return newCategory
  }

  updateCategory(id: string, data: Partial<Category>): Category {
    const categories = this.get<Category>(STORAGE_KEYS.CATEGORIES)
    const index = categories.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Catégorie non trouvée')
    
    categories[index] = { ...categories[index], ...data }
    this.set(STORAGE_KEYS.CATEGORIES, categories)
    return categories[index]
  }

  // PRODUCTS
  getProducts(available?: boolean): Product[] {
    const products = this.get<Product>(STORAGE_KEYS.PRODUCTS)
    const categories = this.getCategories()
    
    // Ajouter les informations de catégorie
    const productsWithCategories = products.map(product => ({
      ...product,
      categories: product.category_id 
        ? { name: categories.find(c => c.id === product.category_id)?.name || '' }
        : undefined
    }))

    return available !== undefined 
      ? productsWithCategories.filter(p => p.is_available === available)
      : productsWithCategories
  }

  createProduct(data: Omit<Product, 'id' | 'categories'>): Product {
    const products = this.get<Product>(STORAGE_KEYS.PRODUCTS)
    const categories = this.getCategories()
    
    const newProduct: Product = {
      ...data,
      id: this.generateId()
    }
    
    // Ajouter les informations de catégorie
    if (newProduct.category_id) {
      const category = categories.find(c => c.id === newProduct.category_id)
      newProduct.categories = category ? { name: category.name } : undefined
    }
    
    products.push(newProduct)
    this.set(STORAGE_KEYS.PRODUCTS, products)
    return newProduct
  }

  updateProduct(id: string, data: Partial<Product>): Product {
    const products = this.get<Product>(STORAGE_KEYS.PRODUCTS)
    const categories = this.getCategories()
    const index = products.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Produit non trouvé')
    
    products[index] = { ...products[index], ...data }
    
    // Mettre à jour les informations de catégorie
    if (products[index].category_id) {
      const category = categories.find(c => c.id === products[index].category_id)
      products[index].categories = category ? { name: category.name } : undefined
    }
    
    this.set(STORAGE_KEYS.PRODUCTS, products)
    return products[index]
  }

  deleteProduct(id: string): void {
    const products = this.get<Product>(STORAGE_KEYS.PRODUCTS)
    const filteredProducts = products.filter(p => p.id !== id)
    this.set(STORAGE_KEYS.PRODUCTS, filteredProducts)
  }

  // NEWS
  getNews(published?: boolean): NewsPost[] {
    const news = this.get<NewsPost>(STORAGE_KEYS.NEWS)
    return (published !== undefined ? news.filter(n => n.published === published) : news)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  createNews(data: Omit<NewsPost, 'id' | 'created_at'>): NewsPost {
    const news = this.get<NewsPost>(STORAGE_KEYS.NEWS)
    const newPost: NewsPost = {
      ...data,
      id: this.generateId(),
      created_at: new Date().toISOString()
    }
    news.push(newPost)
    this.set(STORAGE_KEYS.NEWS, news)
    return newPost
  }

  updateNews(id: string, data: Partial<NewsPost>): NewsPost {
    const news = this.get<NewsPost>(STORAGE_KEYS.NEWS)
    const index = news.findIndex(n => n.id === id)
    if (index === -1) throw new Error('Article non trouvé')
    
    news[index] = { ...news[index], ...data }
    this.set(STORAGE_KEYS.NEWS, news)
    return news[index]
  }

  deleteNews(id: string): void {
    const news = this.get<NewsPost>(STORAGE_KEYS.NEWS)
    const filteredNews = news.filter(n => n.id !== id)
    this.set(STORAGE_KEYS.NEWS, filteredNews)
  }

  // ORDERS
  getOrders(userId?: string): Order[] {
    const orders = this.get<Order>(STORAGE_KEYS.ORDERS)
    const users = this.get<User>(STORAGE_KEYS.USERS)
    const products = this.getProducts()
    
    // Enrichir les commandes avec les informations utilisateur et produit
    const enrichedOrders = orders.map(order => {
      const user = users.find(u => u.id === order.user_id)
      const enrichedItems = order.order_items.map(item => ({
        ...item,
        products: {
          name: products.find(p => p.id === item.product_id)?.name || 'Produit inconnu'
        }
      }))
      
      return {
        ...order,
        order_items: enrichedItems,
        profiles: user ? { full_name: user.full_name, email: user.email } : undefined
      }
    })
    
    return (userId ? enrichedOrders.filter(o => o.user_id === userId) : enrichedOrders)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  createOrder(data: {
    user_id: string
    total_amount: number
    items: Array<{
      product_id: string
      quantity: number
      unit_price: number
      variant?: string
    }>
  }): Order {
    const orders = this.get<Order>(STORAGE_KEYS.ORDERS)
    const products = this.getProducts()
    const users = this.get<User>(STORAGE_KEYS.USERS)
    
    const orderId = this.generateId()
    const orderItems: OrderItem[] = data.items.map(item => {
      const product = products.find(p => p.id === item.product_id)
      return {
        id: this.generateId(),
        order_id: orderId,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price,
        variant: item.variant,
        products: { name: product?.name || 'Produit inconnu' }
      }
    })

    const user = users.find(u => u.id === data.user_id)
    const newOrder: Order = {
      id: orderId,
      user_id: data.user_id,
      total_amount: data.total_amount,
      status: 'pending',
      payment_initiated_at: null,
      payment_notified_at: null,
      confirmed_at: null,
      created_at: new Date().toISOString(),
      order_items: orderItems,
      profiles: user ? { full_name: user.full_name, email: user.email } : undefined
    }

    orders.push(newOrder)
    this.set(STORAGE_KEYS.ORDERS, orders)
    
    // Mettre à jour le stock
    this.updateStock(data.items)
    
    return newOrder
  }

  updateOrder(id: string, data: Partial<Order>): Order {
    const orders = this.get<Order>(STORAGE_KEYS.ORDERS)
    const index = orders.findIndex(o => o.id === id)
    if (index === -1) throw new Error('Commande non trouvée')
    
    const updatedOrder = { ...orders[index], ...data }
    
    // Mettre à jour les timestamps selon le statut
    if (data.status === 'payment_notified' && !updatedOrder.payment_notified_at) {
      updatedOrder.payment_notified_at = new Date().toISOString()
    }
    if (data.status === 'confirmed' && !updatedOrder.confirmed_at) {
      updatedOrder.confirmed_at = new Date().toISOString()
    }
    
    orders[index] = updatedOrder
    this.set(STORAGE_KEYS.ORDERS, orders)
    
    return this.getOrders().find(o => o.id === id)!
  }

  private updateStock(items: Array<{ product_id: string; quantity: number; variant?: string }>) {
    const products = this.get<Product>(STORAGE_KEYS.PRODUCTS)
    
    items.forEach(item => {
      const productIndex = products.findIndex(p => p.id === item.product_id)
      if (productIndex === -1) return
      
      const product = products[productIndex]
      if (!product.stock_enabled) return
      
      if (product.stock_variants && item.variant) {
        // Réduire le stock de la variante
        const variantIndex = product.stock_variants.findIndex(v => v.name === item.variant)
        if (variantIndex !== -1) {
          product.stock_variants[variantIndex].quantity = Math.max(0, product.stock_variants[variantIndex].quantity - item.quantity)
        }
      } else if (product.stock_quantity !== undefined) {
        // Réduire le stock simple
        product.stock_quantity = Math.max(0, product.stock_quantity - item.quantity)
      }
    })
    
    this.set(STORAGE_KEYS.PRODUCTS, products)
  }

  // USERS
  getUsers(): User[] {
    return this.get<User>(STORAGE_KEYS.USERS)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  createUser(data: Omit<User, 'id' | 'created_at'>): User {
    const users = this.get<User>(STORAGE_KEYS.USERS)
    const newUser: User = {
      ...data,
      id: this.generateId(),
      created_at: new Date().toISOString()
    }
    users.push(newUser)
    this.set(STORAGE_KEYS.USERS, users)
    return newUser
  }

  updateUser(id: string, data: Partial<User>): User {
    const users = this.get<User>(STORAGE_KEYS.USERS)
    const index = users.findIndex(u => u.id === id)
    if (index === -1) throw new Error('Utilisateur non trouvé')
    
    users[index] = { ...users[index], ...data }
    this.set(STORAGE_KEYS.USERS, users)
    return users[index]
  }

  // AUTHENTIFICATION
  getCurrentUser(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return userData ? JSON.parse(userData) : null
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    }
  }

  signIn(email: string, password: string): User {
    const users = this.getUsers()
    // Pour la démo, on accepte n'importe quel mot de passe
    const user = users.find(u => u.email === email)
    if (!user) {
      throw new Error('Utilisateur non trouvé')
    }
    this.setCurrentUser(user)
    return user
  }

  signUp(email: string, password: string, fullName: string): User {
    const users = this.getUsers()
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      throw new Error('Un compte avec cet email existe déjà')
    }
    
    const newUser = this.createUser({
      email,
      full_name: fullName,
      username: email.split('@')[0],
      role: 'user'
    })
    
    this.setCurrentUser(newUser)
    return newUser
  }

  signOut(): void {
    this.setCurrentUser(null)
  }

  // STATISTIQUES
  getStatistics(): {
    totalUsers: number
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
  } {
    const users = this.getUsers()
    const orders = this.getOrders()
    
    const totalRevenue = orders
      .filter(order => order.status === 'confirmed')
      .reduce((sum, order) => sum + order.total_amount, 0)
    
    const pendingOrders = orders.filter(order => order.status === 'pending').length
    
    return {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalRevenue,
      pendingOrders
    }
  }
}

export const localStorage = new LocalStorage()