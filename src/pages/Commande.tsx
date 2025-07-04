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
    slug: string
  }
}

interface CartItem {
  product: Product
  quantity: number
}

export function Commande() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name,
            slug
          )
        `)
        .eq('is_available', true)
        .order('name', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
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
    if (!user || cart.length === 0) return

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
        total_price: item.quantity * item.product.price
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

  // Group products by category
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
      <h1 className="text-2xl font-bold text-gray-900">Commander</h1>

      {Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
        <div key={categoryName} className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">{categoryName}</h2>
          
          <div className="space-y-2">
            {categoryProducts.map((product) => (
              <div key={product.id} className="card flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-500">{product.description}</p>
                    )}
                    <p className="text-sm font-semibold text-primary-600">
                      {product.price.toFixed(2)} €
                    </p>
                  </div>
                </div>
                
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

      {products.length === 0 && (
        <div className="card text-center py-8">
          <p className="text-gray-500">Aucun produit disponible pour le moment.</p>
        </div>
      )}
    </div>
  )
}