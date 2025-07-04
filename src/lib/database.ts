import { supabase } from './supabase'
import type { Database } from './supabase'

type Profile = Database['public']['Tables']['profiles']['Row']
type Category = Database['public']['Tables']['categories']['Row']
type Product = Database['public']['Tables']['products']['Row'] & {
  categories?: { name: string }
}
type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: OrderItem[]
  profiles?: { full_name: string; email: string }
}
type OrderItem = Database['public']['Tables']['order_items']['Row'] & {
  products: { name: string }
}
type NewsPost = Database['public']['Tables']['news']['Row']

class SupabaseDatabase {
  // NEWS
  async getNews(published?: boolean): Promise<NewsPost[]> {
    let query = supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false })

    if (published !== undefined) {
      query = query.eq('published', published)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async createNews(data: Omit<NewsPost, 'id' | 'created_at' | 'updated_at'>): Promise<NewsPost> {
    const { data: result, error } = await supabase
      .from('news')
      .insert([{
        ...data,
        author_id: (await supabase.auth.getUser()).data.user?.id || null
      }])
      .select()
      .single()

    if (error) throw error
    return result
  }

  async updateNews(id: string, data: Partial<NewsPost>): Promise<NewsPost> {
    const { data: result, error } = await supabase
      .from('news')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async deleteNews(id: string): Promise<void> {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  }

  async createCategory(data: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
    const { data: result, error } = await supabase
      .from('categories')
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return result
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const { data: result, error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return result
  }

  async moveCategoryUp(id: string): Promise<void> {
    // Get current category
    const { data: currentCategory, error: currentError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (currentError) throw currentError

    // Get previous category
    const { data: previousCategory, error: previousError } = await supabase
      .from('categories')
      .select('*')
      .lt('display_order', currentCategory.display_order)
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    if (previousError || !previousCategory) return

    // Swap display orders
    const tempOrder = currentCategory.display_order
    await this.updateCategory(currentCategory.id, { display_order: previousCategory.display_order })
    await this.updateCategory(previousCategory.id, { display_order: tempOrder })
  }

  async moveCategoryDown(id: string): Promise<void> {
    // Get current category
    const { data: currentCategory, error: currentError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (currentError) throw currentError

    // Get next category
    const { data: nextCategory, error: nextError } = await supabase
      .from('categories')
      .select('*')
      .gt('display_order', currentCategory.display_order)
      .order('display_order', { ascending: true })
      .limit(1)
      .single()

    if (nextError || !nextCategory) return

    // Swap display orders
    const tempOrder = currentCategory.display_order
    await this.updateCategory(currentCategory.id, { display_order: nextCategory.display_order })
    await this.updateCategory(nextCategory.id, { display_order: tempOrder })
  }

  // PRODUCTS
  async getProducts(available?: boolean): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        categories (
          name
        )
      `)
      .order('name', { ascending: true })

    if (available !== undefined) {
      query = query.eq('is_available', available)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async createProduct(data: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'categories'>): Promise<Product> {
    const { data: result, error } = await supabase
      .from('products')
      .insert([data])
      .select(`
        *,
        categories (
          name
        )
      `)
      .single()

    if (error) throw error
    return result
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const { data: result, error } = await supabase
      .from('products')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        categories (
          name
        )
      `)
      .single()

    if (error) throw error
    return result
  }

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // ORDERS
  async getOrders(userId?: string): Promise<Order[]> {
    let query = supabase
      .from('orders')
      .select(`
        *,
        profiles (
          full_name,
          email
        ),
        order_items (
          *,
          products (
            name
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async createOrder(data: {
    user_id: string
    total_amount: number
    items: Array<{
      product_id: string
      quantity: number
      unit_price: number
      variant?: string
    }>
  }): Promise<Order> {
    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: data.user_id,
        total_amount: data.total_amount,
        status: 'pending'
      }])
      .select()
      .single()

    if (orderError) throw orderError

    // Create order items
    const orderItems = data.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price,
      variant: item.variant || null
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // Update stock if enabled
    await this.updateStock(data.items)

    // Return complete order
    return this.getOrderById(order.id)
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    // Update timestamps based on status
    const updateData = { ...data }
    if (data.status === 'payment_notified' && !updateData.payment_notified_at) {
      updateData.payment_notified_at = new Date().toISOString()
    }
    if (data.status === 'confirmed' && !updateData.confirmed_at) {
      updateData.confirmed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)

    if (error) throw error

    return this.getOrderById(id)
  }

  private async getOrderById(id: string): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        profiles (
          full_name,
          email
        ),
        order_items (
          *,
          products (
            name
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  private async updateStock(items: Array<{ product_id: string; quantity: number; variant?: string }>) {
    for (const item of items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', item.product_id)
        .single()

      if (error || !product || !product.stock_enabled) continue

      if (product.stock_variants && item.variant) {
        // Update variant stock
        const variants = product.stock_variants as Array<{ name: string; quantity: number }>
        const updatedVariants = variants.map((v: { name: string; quantity: number }) => 
          v.name === item.variant 
            ? { ...v, quantity: Math.max(0, v.quantity - item.quantity) }
            : v
        )

        await supabase
          .from('products')
          .update({ stock_variants: updatedVariants })
          .eq('id', item.product_id)
      } else if (product.stock_quantity !== null) {
        // Update simple stock
        const newQuantity = Math.max(0, product.stock_quantity - item.quantity)
        await supabase
          .from('products')
          .update({ stock_quantity: newQuantity })
          .eq('id', item.product_id)
      }
    }
  }

  // USERS
  async getUsers(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.getOrders(userId)
  }

  // ADMIN FUNCTIONS
  async createAdminUser(email: string, password: string, fullName: string): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: email.split('@')[0],
          role: 'admin'
        }
      }
    })
    if (error) throw error
  }

  // STATISTICS
  async getStatistics(): Promise<{
    totalUsers: number
    totalOrders: number
    totalRevenue: number
    pendingOrders: number
  }> {
    const [users, orders] = await Promise.all([
      this.getUsers(),
      this.getOrders()
    ])

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

export const database = new SupabaseDatabase()
export type { Profile, Category, Product, Order, OrderItem, NewsPost }