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
  display_order: number
}

interface Category {
  id: string
  name: string
  slug: string
  display_order: number
}

interface CartItem {
  product: Product
  quantity: number
}

export function Commande() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Récupérer les catégories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })

      if (categoriesError) throw categoriesError

      // Récupérer les produits
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('display_order', { ascending: true })

      if (productsError) throw productsError

      setCategories(categoriesData || [])
      setProducts(productsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
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

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId))
      return
    }

    const product = products.find(p => p.id === productId)
    if (!product) return

    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === productId)
      if (existingItem) {
        return prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      }
      return [...prev, { product, quantity }]
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

    setSubmitting(true)
    try {
      const totalAmount = getTotalAmount()

      // Créer la commande
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

      // Créer les articles de commande
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

      // Vider le panier
      setCart([])
      alert('Commande validée avec succès !')
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('Erreur lors de la validation de la commande')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Commander</h1>

      {categories.map((category) => {
        const categoryProducts = products.filter(p => p.category_id === category.id)
        
        if (categoryProducts.length === 0) return null

        return (
          <div key={category.id} className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 uppercase">{category.name}</h2>
            
            <div className="space-y-2">
              {categoryProducts.map((product) => {
                const quantity = getQuantity(product.id)
                const itemTotal = quantity * product.price

                return (
                  <div key={product.id} className="card flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-gray-500">{product.description}</p>
                      )}
                      <p className="text-sm text-gray-600">{product.price.toFixed(2)} €</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => removeFromCart(product.id)}
                        className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                        disabled={quantity === 0}
                      >
                        <Minus size={16} />
                      </button>
                      
                      <input
                        type="number"
                        min="0"
                        value={quantity}
                        onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 0)}
                        className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                      />
                      
                      <button
                        onClick={() => addToCart(product)}
                        className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors"
                      >
                        <Plus size={16} />
                      </button>

                      {quantity > 0 && (
                        <div className="text-sm font-medium text-primary-600 min-w-[60px] text-right">
                          {itemTotal.toFixed(2)} €
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

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