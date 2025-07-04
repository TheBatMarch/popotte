import React, { useEffect, useState } from 'react'
import { CreditCard, ExternalLink } from 'lucide-react'
import supabase from '../lib/supabaseClient'
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
  const [error, setError] = useState<string | null>(null)
  
  // ID utilisateur factice pour les tests
  const testUserId = 'test-user-id'

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {

    try {
      setLoading(true)
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
        .eq('user_id', user?.id || testUserId)
        .order('created_at', { ascending: false })

      console.log('Orders data:', data, 'Error:', error)

      if (error) {
        setError('Erreur lors du chargement des commandes')
        console.error('Error fetching orders:', error)
        return
      }

      setOrders(data || [])
    } catch (err) {
      setError('Erreur de connexion')
      console.error('Network error:', err)
    } finally {
      setLoading(false)
    }
  }

  const notifyPayment = async (orderIds: string[]) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'payment_notified',
          payment_notified_at: new Date().toISOString()
        })
        .in('id', orderIds)

      if (error) throw error
      
      fetchOrders()
      alert('Paiement notifié aux popottiers !')
    } catch (error) {
      console.error('Error notifying payment:', error)
      alert('Erreur lors de la notification')
    }
  }

  const formatDateTime = (dateString: string) => {
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

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes Dettes</h1>
        <div className="card bg-red-50 border-red-200 text-center py-8">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchOrders}
            className="mt-4 btn-primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mes Dettes</h1>

      {/* Section NON PAYEES (rouge) */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-red-600">NON PAYÉES</h2>
        
        {pendingOrders.length === 0 ? (
          <div className="card bg-red-50 border-red-200 text-center py-8">
            <p className="text-red-600">Aucune dette en attente.</p>
          </div>
        ) : (
          <>
            {pendingOrders.map((order) => (
              <div key={order.id} className="card bg-red-50 border-l-4 border-red-500">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-600">
                    {formatDateTime(order.created_at)}
                  </span>
                  <span className="font-semibold text-red-600">
                    {order.total_amount.toFixed(2)} €
                  </span>
                </div>
                
                <div className="space-y-1">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="text-sm text-gray-700">
                      {item.quantity}x {item.products.name} - {item.total_price.toFixed(2)} €
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <div className="card bg-red-100 border-red-300">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold text-red-800">Total à régler :</span>
                <span className="text-xl font-bold text-red-600">
                  {pendingTotal.toFixed(2)} €
                </span>
              </div>
              
              <div className="space-y-2">
                <a
                  href={`https://paypal.me/popotte/${pendingTotal.toFixed(2)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                  onClick={() => {
                    setTimeout(() => {
                      const notifyButton = document.getElementById('notify-button')
                      if (notifyButton) {
                        notifyButton.style.display = 'block'
                      }
                    }, 1000)
                  }}
                >
                  <CreditCard size={20} />
                  <span>Payer {pendingTotal.toFixed(2)} € sur PayPal</span>
                  <ExternalLink size={16} />
                </a>
                
                <button
                  id="notify-button"
                  onClick={() => notifyPayment(pendingOrders.map(o => o.id))}
                  className="w-full btn-secondary"
                  style={{ display: 'none' }}
                >
                  Notifier les popottiers du paiement
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Section EN ATTENTE (gris) */}
      {notifiedOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-600">EN ATTENTE</h2>
          
          {notifiedOrders.map((order) => (
            <div key={order.id} className="card bg-gray-50 border-l-4 border-gray-500">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-600">
                  {formatDateTime(order.created_at)}
                </span>
                <span className="font-semibold text-gray-600">
                  {order.total_amount.toFixed(2)} €
                </span>
              </div>
              
              <div className="space-y-1">
                {order.order_items.map((item) => (
                  <div key={item.id} className="text-sm text-gray-700">
                    {item.quantity}x {item.products.name} - {item.total_price.toFixed(2)} €
                  </div>
                ))}
              </div>
              
              <div className="mt-2 text-sm text-gray-600 font-medium">
                En attente de confirmation
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Section PAYÉES (vert) */}
      {confirmedOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-green-600">PAYÉES</h2>
          
          {confirmedOrders.map((order) => (
            <div key={order.id} className="card bg-green-50 border-l-4 border-green-500">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-600">
                  {formatDateTime(order.created_at)}
                </span>
                <span className="font-semibold text-green-600">
                  {order.total_amount.toFixed(2)} €
                </span>
              </div>
              
              <div className="space-y-1">
                {order.order_items.map((item) => (
                  <div key={item.id} className="text-sm text-gray-700">
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