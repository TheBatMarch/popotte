import React, { useEffect, useState } from 'react'
import { Plus, Minus, ShoppingCart } from 'lucide-react'
import { mockDatabase } from '../lib/mockDatabase'
import { useAuth } from '../contexts/AuthContext'
import type { Product } from '../lib/mockData'

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
      const data = await mockDatabase.getProducts(true)
      setProducts(data)
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
      const items = cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price
      }))

      await mockDatabase.createOrder({
        user_id: user.id,
        total_amount: totalAmount,
        items
      })

      setCart([])
      alert('Commande validée avec succès !')
    } catch (error) {
      console.error('Error submitting order:', error)
      alert('Erreur lors de la validation de la commande')
    } finally {
      setSubmitting(false)
    }
  }

  // Récupérer les catégories pour l'ordre d'affichage
  const [categories, setCategories] = useState<any[]>([])
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await mockDatabase.getCategories()
        setCategories(data)
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }
    fetchCategories()
  }, [])

  // Grouper les produits par catégorie dans l'ordre défini
  const groupedProducts = categories.reduce((acc, category) => {
    const categoryProducts = products.filter(p => p.category_id === category.id)
    if (categoryProducts.length > 0) {
      acc[category.name] = categoryProducts
    }
    return acc
  }, {} as Record<string, Product[]>)

  // Ajouter les produits sans catégorie à la fin
  const uncategorizedProducts = products.filter(p => !p.category_id)
  if (uncategorizedProducts.length > 0) {
    groupedProducts['Sans catégorie'] = uncategorizedProducts
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Commander</h1>
        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
          Mode démo
        </div>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-700">
          💡 Produits de démonstration. Toutes les commandes sont simulées.
        </p>
      </div>

      {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
        <div key={category} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">{category}</h2>
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                {categoryProducts.length} produit{categoryProducts.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          <div className="space-y-3 ml-4">
            {categoryProducts.map((product) => (
              <div key={product.id} className="card flex items-center justify-between">
                <div className="flex space-x-3 flex-1">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-medium">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-500">{product.description}</p>
                    )}
                    <p className="text-lg font-semibold text-primary-600">{product.price.toFixed(2)} €</p>
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
    </div>
  )
}