export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          monthly_credits: number | null
          subscription_tier: string | null
          used_credits: number | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          monthly_credits?: number | null
          subscription_tier?: string | null
          used_credits?: number | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          monthly_credits?: number | null
          subscription_tier?: string | null
          used_credits?: number | null
          username?: string | null
        }
      }
      prompt_categories: {
        Row: {
          category_id: string
          prompt_id: string
          prompt_title: string | null
          category_name: string | null
        }
        Insert: {
          category_id: string
          prompt_id: string
          prompt_title?: string | null
          category_name?: string | null
        }
        Update: {
          category_id?: string
          prompt_id?: string
          prompt_title?: string | null
          category_name?: string | null
        }
      }
      prompts: {
        Row: {
          author_id: string
          copies_count: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_premium: boolean | null
          likes_count: number | null
          prompt_text: string
          title: string
          views_count: number | null
          status: string | null
          price: number | null
        }
        Insert: {
          author_id: string
          copies_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          likes_count?: number | null
          prompt_text: string
          title: string
          views_count?: number | null
          status?: string | null
          price?: number | null
        }
        Update: {
          author_id?: string
          copies_count?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_premium?: boolean | null
          likes_count?: number | null
          prompt_text?: string
          title?: string
          views_count?: number | null
          status?: string | null
          price?: number | null
        }
      }
      user_likes: {
        Row: {
          created_at: string
          prompt_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          prompt_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          prompt_id?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
