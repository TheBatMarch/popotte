import React, { useEffect, useState } from 'react'
import { Shield } from 'lucide-react'
import supabase from '../../lib/supabaseClient'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

interface UserOrder {
  id: string
  total_amount: number
  status: 'pending' | 'payment_notified' | 'confirmed' | 'cancelled'
  created_at: string
}

export function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userOrders, setUserOrders] = useState<UserOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [addDebtAmount, setAddDebtAmount] = useState('')
  const [addDebtDescription, setAddDebtDescription] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Users data:', data, 'Error:', error)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserOrders = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUserOrders(data || [])
    } catch (error) {
      console.error('Error fetching user orders:', error)
    }
  }

  const confirmPayment = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', orderId)

      if (error) throw error
      
      if (selectedUser) {
        fetchUserOrders(selectedUser.id)
      }
      alert('Paiement confirmé !')
    } catch (error) {
      console.error('Error confirming payment:', error)
      alert('Erreur lors de la confirmation')
    }
  }

  const addDebt = async () => {
    if (!selectedUser || !addDebtAmount || !addDebtDescription) return

    try {
      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: selectedUser.id,
          total_amount: parseFloat(addDebtAmount),
          status: 'pending'
        })

      if (error) throw error

      setAddDebtAmount('')
      setAddDebtDescription('')
      fetchUserOrders(selectedUser.id)
      alert('Dette ajoutée avec succès !')
    } catch (error) {
      console.error('Error adding debt:', error)
      alert('Erreur lors de l\'ajout de la dette')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-red-600'
      case 'payment_notified': return 'text-orange-600'
      case 'confirmed': return 'text-green-600'
      case 'cancelled': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'payment_notified': return 'Paiement notifié'
      case 'confirmed': return 'Confirmé'
      case 'cancelled': return 'Annulé'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (selectedUser) {
    const pendingTotal = userOrders
      .filter(order => order.status === 'pending')
      .reduce((sum, order) => sum + order.total_amount, 0)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Gestion de {selectedUser.full_name}
          </h2>
          <button
            onClick={() => setSelectedUser(null)}
            className="btn-secondary"
          >
            Retour
          </button>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {selectedUser.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold">{selectedUser.full_name}</h3>
              <p className="text-sm text-gray-600">{selectedUser.email}</p>
              {selectedUser.role === 'admin' && (
                <div className="flex items-center space-x-1 mt-1">
                  <Shield size={14} className="text-primary-500" />
                  <span className="text-xs text-primary-600">Admin</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Total des dettes en attente :</p>
            <p className="text-xl font-bold text-red-600">{pendingTotal.toFixed(2)} €</p>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Ajouter une dette</h3>
          <div className="space-y-3">
            <input
              type="number"
              step="0.01"
              placeholder="Montant (€)"
              value={addDebtAmount}
              onChange={(e) => setAddDebtAmount(e.target.value)}
              className="input"
            />
            <input
              type="text"
              placeholder="Description"
              value={addDebtDescription}
              onChange={(e) => setAddDebtDescription(e.target.value)}
              className="input"
            />
            <button
              onClick={addDebt}
              className="btn-primary"
              disabled={!addDebtAmount || !addDebtDescription}
            >
              Ajouter la dette
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Historique des commandes</h3>
          
          {userOrders.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-500">Aucune commande trouvée.</p>
            </div>
          ) : (
            userOrders.map((order) => (
              <div key={order.id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </span>
                  <div className="text-right">
                    <div className="font-semibold">{order.total_amount.toFixed(2)} €</div>
                    <div className={`text-sm ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </div>
                  </div>
                </div>
                
                {order.status === 'payment_notified' && (
                  <button
                    onClick={() => confirmPayment(order.id)}
                    className="mt-2 btn-primary text-sm"
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Gestion des utilisateurs</h2>
      
      {users.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">Aucun utilisateur trouvé.</p>
        </div>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            className="card hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => {
              setSelectedUser(user)
              fetchUserOrders(user.id)
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-semibold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium">{user.full_name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500">
                    Inscrit le {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {user.role === 'admin' && (
                  <Shield size={16} className="text-primary-500" />
                )}
                <span className="text-gray-400">→</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}