import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-ref') || supabaseAnonKey.includes('your-anon-key')) {
  console.warn('⚠️ Variables d\'environnement Supabase manquantes ou non configurées')
  console.warn('📝 Veuillez configurer VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans le fichier .env')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          username: string
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          username: string
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          username?: string
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          display_order?: number
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category_id: string | null
          image_url: string | null
          is_available: boolean
          display_order: number
          stock_enabled: boolean
          stock_quantity: number | null
          stock_variants: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category_id?: string | null
          image_url?: string | null
          is_available?: boolean
          display_order?: number
          stock_enabled?: boolean
          stock_quantity?: number | null
          stock_variants?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category_id?: string | null
          image_url?: string | null
          is_available?: boolean
          display_order?: number
          stock_enabled?: boolean
          stock_quantity?: number | null
          stock_variants?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          total_amount: number
          status: 'pending' | 'payment_notified' | 'confirmed' | 'cancelled'
          payment_initiated_at: string | null
          payment_notified_at: string | null
          confirmed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_amount: number
          status?: 'pending' | 'payment_notified' | 'confirmed' | 'cancelled'
          payment_initiated_at?: string | null
          payment_notified_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          total_amount?: number
          status?: 'pending' | 'payment_notified' | 'confirmed' | 'cancelled'
          payment_initiated_at?: string | null
          payment_notified_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          variant: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          variant?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          total_price?: number
          variant?: string | null
          created_at?: string
        }
      }
      news: {
        Row: {
          id: string
          title: string
          content: string
          excerpt: string | null
          image_url: string | null
          author_id: string | null
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          excerpt?: string | null
          image_url?: string | null
          author_id?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          excerpt?: string | null
          image_url?: string | null
          author_id?: string | null
          published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}