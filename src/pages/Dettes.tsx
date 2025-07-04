import React, { useEffect, useState } from 'react'
import { CreditCard, ExternalLink } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Order {
  id: string
  total_amount: number
  status: 'pending' | 'payment_notified' | 'confirmed' | 'cancelled'
  created_at: string
  order_items: {
    id: string
    quantity: number
    unit_price: number
    total_price: number
    products: {
      name: string
    }
  }[]
}

export function Dettes() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchOrders()
      console.log('Chargement des commandes pour:', user.id)
    }
  }, [user])

  const fetchOrders = async () => {
    if (!user) return
    console.log('Début fetchOrders pour user:', user.id)

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            quantity,
            unit_price,
            total_price,
            products (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('Commandes récupérées:', data)
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      alert('Erreur lors du chargement des commandes: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const notifyPayment = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'payment_notified',
          payment_notified_at: new Date().toISOString()
        })
        .eq('id', orderId)

      if (error) throw error
      
      // Refresh orders
      fetchOrders()
      alert('Paiement notifié aux popottiers !')
    } catch (error) {
      console.error('Error notifying payment:', error)
      alert('Erreur lors de la notification')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const pendingOrders = orders.filter(order => order.status === 'pending')
  const notifiedOrders = orders.filter(order => order.status === 'payment_notified')
  const confirmedOrders = orders.filter(order => order.status === 'confirmed')

  const pendingTotal = pendingOrders.reduce((sum, order) => sum + order.total_amount, 0)

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mes Dettes</h1>

      {/* Dettes non réglées */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-red-600">Dettes non réglées</h2>
        
        {pendingOrders.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">Aucune dette en attente.</p>
          </div>
        ) : (
          <>
            {pendingOrders.map((order) => (
              <div key={order.id} className="card border-l-4 border-red-500">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </span>
                  <span className="font-semibold text-red-600">
                    {order.total_amount.toFixed(2)} €
                  </span>
                </div>
                
                <div className="space-y-1">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="text-sm text-gray-600">
                      {item.quantity}x {item.products.name} - {item.total_price.toFixed(2)} €
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="card bg-red-50 border-red-200">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total à régler :</span>
                <span className="text-xl font-bold text-red-600">
                  {pendingTotal.toFixed(2)} €
                </span>
              </div>
              
              <div className="space-y-2">
                <a
                  href="https://paypal.me/popotte"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <CreditCard size={20} />
                  <span>Régler mes dettes</span>
                  <ExternalLink size={16} />
                </a>
                
                <button
                  onClick={() => {
                    pendingOrders.forEach(order => notifyPayment(order.id))
                  }}
                  className="w-full btn-secondary"
                >
                  Notifier mon paiement aux popottiers
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Paiements en attente de confirmation */}
      {notifiedOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-orange-600">Paiements en attente de confirmation</h2>
          
          {notifiedOrders.map((order) => (
            <div key={order.id} className="card border-l-4 border-orange-500">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">
                  {formatDate(order.created_at)}
                </span>
                <span className="font-semibold text-orange-600">
                  {order.total_amount.toFixed(2)} €
                </span>
              </div>
              
              <div className="space-y-1">
                {order.order_items.map((item) => (
                  <div key={item.id} className="text-sm text-gray-600">
                    {item.quantity}x {item.products.name} - {item.total_price.toFixed(2)} €
                  </div>
                ))}
              </div>
              
              <div className="mt-2 text-sm text-orange-600 font-medium">
                En attente de confirmation
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dettes réglées */}
      {confirmedOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-green-600">Mes dettes réglées</h2>
          
          {confirmedOrders.map((order) => (
            <div key={order.id} className="card border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">
                  {formatDate(order.created_at)}
                </span>
                <span className="font-semibold text-green-600">
                  {order.total_amount.toFixed(2)} €
                </span>
              </div>
              
              <div className="space-y-1">
                {order.order_items.map((item) => (
                  <div key={item.id} className="text-sm text-gray-600">
                    {item.quantity}x {item.products.name} - {item.total_price.toFixed(2)} €
                  </div>
                ))}
              </div>
              
              <div className="mt-2 text-sm text-green-600 font-medium">
                ✓ Confirmé
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}