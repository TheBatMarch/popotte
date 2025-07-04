import React, { useEffect, useState } from 'react'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category_id: string | null
  image_url: string | null
  is_available: boolean
  categories?: {
    name: string
  }
}

interface CartItem {
  product: Product
  quantity: number
}

// Produits de démonstration
const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-1',
    name: 'Couscous royal',
    description: 'Couscous traditionnel avec merguez, agneau et légumes',
    price: 12.50,
    category_id: 'demo-cat-1',
    image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    is_available: true,
    categories: { name: 'Plats principaux' }
  },
  {
    id: 'demo-2',
    name: 'Tajine de poulet',
    description: 'Tajine de poulet aux olives et citrons confits',
    price: 11.00,
    category_id: 'demo-cat-1',
    image_url: 'https://images.pexels.com/photos/5949888/pexels-photo-5949888.jpeg',
    is_available: true,
    categories: { name: 'Plats principaux' }
  },
  {
    id: 'demo-3',
    name: 'Pastilla au poisson',
    description: 'Pastilla traditionnelle au poisson et aux épices',
    price: 9.50,
    category_id: 'demo-cat-1',
    image_url: 'https://images.pexels.com/photos/4518843/pexels-photo-4518843.jpeg',
    is_available: true,
    categories: { name: 'Plats principaux' }
  },
  {
    id: 'demo-4',
    name: 'Harira',
    description: 'Soupe traditionnelle marocaine aux lentilles',
    price: 4.50,
    category_id: 'demo-cat-2',
    image_url: 'https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg',
    is_available: true,
    categories: { name: 'Entrées' }
  },
  {
    id: 'demo-5',
    name: 'Salade marocaine',
    description: 'Salade fraîche aux tomates, concombres et herbes',
    price: 5.00,
    category_id: 'demo-cat-2',
    image_url: 'https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg',
    is_available: true,
    categories: { name: 'Entrées' }
  },
  {
    id: 'demo-6',
    name: 'Thé à la menthe',
    description: 'Thé traditionnel marocain à la menthe fraîche',
    price: 2.50,
    category_id: 'demo-cat-3',
    image_url: 'https://images.pexels.com/photos/230477/pexels-photo-230477.jpeg',
    is_available: true,
    categories: { name: 'Boissons' }
  },
  {
    id: 'demo-7',
    name: 'Jus d\'orange frais',
    description: 'Jus d\'orange pressé du jour',
    price: 3.00,
    category_id: 'demo-cat-3',
    image_url: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg',
    is_available: true,
    categories: { name: 'Boissons' }
  },
  {
    id: 'demo-8',
    name: 'Cornes de gazelle',
    description: 'Pâtisseries traditionnelles aux amandes',
    price: 6.00,
    category_id: 'demo-cat-4',
    image_url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
    is_available: true,
    categories: { name: 'Desserts' }
  },
  {
    id: 'demo-9',
    name: 'Chebakia',
    description: 'Pâtisseries au miel et graines de sésame',
    price: 5.50,
    category_id: 'demo-cat-4',
    image_url: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg',
    is_available: true,
    categories: { name: 'Desserts' }
  }
]

export function Commande() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [usingDemo, setUsingDemo] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      console.log('🔍 Tentative de récupération des produits...')
      
      // Vérifier si Supabase est configuré
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log('⚠️ Supabase non configuré, utilisation des produits de démonstration')
        setProducts(DEMO_PRODUCTS)
        setUsingDemo(true)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('is_available', true)
        .order('name', { ascending: true })

      if (error) {
        console.error('❌ Erreur lors de la récupération des produits:', error)
        console.log('🔄 Basculement vers les produits de démonstration')
        setProducts(DEMO_PRODUCTS)
        setUsingDemo(true)
      } else {
        console.log('✅ Produits récupérés:', data?.length || 0, 'produits')
        if (data && data.length > 0) {
          setProducts(data)
          setUsingDemo(false)
        } else {
          console.log('📦 Aucun produit trouvé, utilisation des produits de démonstration')
          setProducts(DEMO_PRODUCTS)
          setUsingDemo(true)
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      console.log('🔄 Basculement vers les produits de démonstration')
      setProducts(DEMO_PRODUCTS)
      setUsingDemo(true)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id)
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === productId)
      if (existingItem && existingItem.quantity > 1) {
        return prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      }
      return prev.filter(item => item.product.id !== productId)
    })
  }

  const getQuantity = (productId: string) => {
    const item = cart.find(item => item.product.id === productId)
    return item ? item.quantity : 0
  }

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const submitOrder = async () => {
    if (!user || cart.length === 0) {
      if (!user) {
        alert('Vous devez être connecté pour passer une commande')
        return
      }
      return
    }

    if (usingDemo) {
      alert('Mode démonstration : Votre commande de ' + getTotalAmount().toFixed(2) + '€ a été simulée avec succès !')
      setCart([])
      return
    }

    setSubmitting(true)
    try {
      const totalAmount = getTotalAmount()

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: totalAmount,
          status: 'pending'
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Clear cart
      setCart([])
      alert('Commande validée avec succès !')
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('Erreur lors de la validation de la commande')
    } finally {
      setSubmitting(false)
    }
  }

  const groupedProducts = products.reduce((acc, product) => {
    const categoryName = product.categories?.name || 'Sans catégorie'
    if (!acc[categoryName]) {
      acc[categoryName] = []
    }
    acc[categoryName].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Commander</h1>
        {usingDemo && (
          <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
            Mode démo
          </div>
        )}
      </div>

      {usingDemo && (
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-700">
            💡 Produits de démonstration affichés. Connectez Supabase pour voir le menu réel.
          </p>
        </div>
      )}

      {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
        <div key={category} className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">{category}</h2>
          
          <div className="space-y-2">
            {categoryProducts.map((product) => (
              <div key={product.id} className="card flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-500">{product.description}</p>
                  )}
                  <p className="text-sm text-gray-600">{product.price.toFixed(2)} €</p>
                </div>
                
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg mx-4"
                  />
                )}
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                    disabled={getQuantity(product.id) === 0}
                  >
                    <Minus size={16} />
                  </button>
                  
                  <span className="w-8 text-center font-medium">
                    {getQuantity(product.id)}
                  </span>
                  
                  <button
                    onClick={() => addToCart(product)}
                    className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {cart.length > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={submitOrder}
            disabled={submitting}
            className="btn-primary flex items-center space-x-2 shadow-lg disabled:opacity-50"
          >
            <ShoppingCart size={20} />
            <span>Valider ({getTotalAmount().toFixed(2)} €)</span>
          </button>
        </div>
      )}
    </div>
  )
}