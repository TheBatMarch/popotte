import React, { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface OrderWithDetails {
  id: string
  total_amount: number
  status: 'pending' | 'payment_notified' | 'paid'
  created_at: string
  profiles: {
    full_name: string
    email: string
  }
  order_items: {
    id: string
    quantity: number
    unit_price: number
    products: {
      name: string
    }
  }[]
}

export function Orders() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'payment_notified' | 'paid'>('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles (
            full_name,
            email
          ),
          order_items (
            id,
            quantity,
            unit_price,
            products (
              name
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const confirmPayment = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', orderId)

      if (error) throw error
      
      fetchOrders()
      alert('Paiement confirmé !')
    } catch (error) {
      console.error('Error confirming payment:', error)
      alert('Erreur lors de la confirmation')
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-red-500 bg-red-50'
      case 'payment_notified': return 'border-orange-500 bg-orange-50'
      case 'paid': return 'border-green-500 bg-green-50'
      default: return 'border-gray-500 bg-gray-50'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'payment_notified': return 'Paiement notifié'
      case 'paid': return 'Payé'
      default: return status
    }
  }

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  )

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    notified: orders.filter(o => o.status === 'payment_notified').length,
    paid: orders.filter(o => o.status === 'paid').length,
    totalAmount: orders.reduce((sum, o) => sum + o.total_amount, 0)
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
      <h2 className="text-xl font-semibold">Gestion des commandes</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total commandes</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{stats.totalAmount.toFixed(2)} €</div>
          <div className="text-sm text-gray-600">Chiffre d'affaires</div>
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filter === 'all' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Toutes ({stats.total})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filter === 'pending' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          En attente ({stats.pending})
        </button>
        <button
          onClick={() => setFilter('payment_notified')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filter === 'payment_notified' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Notifiées ({stats.notified})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
            filter === 'paid' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Payées ({stats.paid})
        </button>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500">Aucune commande trouvée.</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className={`card border-l-4 ${getStatusColor(order.status)}`}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold">{order.profiles.full_name}</h3>
                  <p className="text-sm text-gray-600">{order.profiles.email}</p>
                  <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{order.total_amount.toFixed(2)} €</div>
                  <div className="text-sm font-medium">
                    {getStatusLabel(order.status)}
                  </div>
                </div>
              </div>

              <div className="space-y-1 mb-3">
                {order.order_items.map((item) => (
                  <div key={item.id} className="text-sm text-gray-600 flex justify-between">
                    <span>{item.quantity}x {item.products.name}</span>
                    <span>{(item.quantity * item.unit_price).toFixed(2)} €</span>
                  </div>
                ))}
              </div>

              {order.status === 'payment_notified' && (
                <button
                  onClick={() => confirmPayment(order.id)}
                  className="btn-primary text-sm"
                >
                  Confirmer le paiement
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}