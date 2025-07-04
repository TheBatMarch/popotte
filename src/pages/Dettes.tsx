import React, { useEffect, useState } from 'react'
import { CreditCard, ExternalLink, Bell } from 'lucide-react'
import { mockDatabase } from '../lib/mockDatabase'
import { useAuth } from '../contexts/AuthContext'
import type { Order } from '../lib/mockData'

export function Dettes() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [paymentInitiated, setPaymentInitiated] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (user) {
      fetchOrders()
    }
  }, [user])

  const fetchOrders = async () => {
    if (!user) return

    try {
      const data = await mockDatabase.getOrders(user.id)
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const initiatePayment = (orderId: string) => {
    setPaymentInitiated(prev => ({ ...prev, [orderId]: true }))
  }

  const notifyPayment = async (orderId: string) => {
    try {
      await mockDatabase.updateOrder(orderId, { 
        status: 'payment_notified',
        payment_initiated_at: new Date().toISOString()
      })
      
      setPaymentInitiated(prev => ({ ...prev, [orderId]: false }))
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
  const hasInitiatedPayments = Object.values(paymentInitiated).some(initiated => initiated)

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
        <h1 className="text-2xl font-bold text-gray-900">Mes Dettes</h1>
        <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
          Mode démo
        </div>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <p className="text-sm text-blue-700">
          💡 Données de démonstration. Les paiements sont simulés.
        </p>
      </div>

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
                  onClick={() => {
                    pendingOrders.forEach(order => initiatePayment(order.id))
                  }}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <CreditCard size={20} />
                  <span>Régler mes dettes</span>
                  <ExternalLink size={16} />
                </a>
                
                {hasInitiatedPayments && (
                  <button
                    onClick={() => {
                      pendingOrders.forEach(order => {
                        if (paymentInitiated[order.id]) {
                          notifyPayment(order.id)
                        }
                      })
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Bell size={20} />
                    <span>Notifier mon paiement aux popottiers</span>
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Paiements en attente de confirmation */}
      {notifiedOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-orange-600">Dettes en attente de confirmation</h2>
          
          {notifiedOrders.map((order) => (
            <div key={order.id} className="card border-l-4 border-orange-500 bg-orange-50">
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
                ⏳ En attente de confirmation par les popottiers
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dettes réglées */}
      {confirmedOrders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-green-600">Dettes réglées</h2>
          
          {confirmedOrders.map((order) => (
            <div key={order.id} className="card border-l-4 border-green-500 bg-green-50">
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
                ✅ Paiement confirmé
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}