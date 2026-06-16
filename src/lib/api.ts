/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from './supabase';
import type { Database } from './database.types';

export type Prompt = Database['public']['Tables']['prompts']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];

// To join authors and categories, we need a composite type
export interface PromptWithAuthor extends Prompt {
  author: {
    full_name: string | null;
    avatar_url: string | null;
    username: string | null;
  };
  categories?: {
    name: string;
    slug: string;
  }[];
}

const isValidUUID = (id: string) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

export const api = {
  // Fetch Trending Prompts (highest views)
  async getTrendingPrompts(limit = 10): Promise<PromptWithAuthor[]> {
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        author:profiles!prompts_author_id_fkey(full_name, avatar_url, username)
      `)
      .eq('status', 'published')
      .order('views_count', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching trending prompts:', error);
      return [];
    }
    // Supabase returns foreign joins as arrays or single objects depending on relationship.
    return (data as unknown) as PromptWithAuthor[];
  },

  // Fetch Most Copied Prompts
  async getMostCopiedPrompts(limit = 10): Promise<PromptWithAuthor[]> {
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        author:profiles!prompts_author_id_fkey(full_name, avatar_url, username)
      `)
      .eq('status', 'published')
      .order('copies_count', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching most copied prompts:', error);
      return [];
    }
    return (data as unknown) as PromptWithAuthor[];
  },

  // Get all categories
  async getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    return data;
  },

  // Search Prompts (by category slug or text query)
  async searchPrompts(query = '', categorySlug = ''): Promise<PromptWithAuthor[]> {
    let data, error;
    
    if (query && query.trim() !== '') {
      // Use the new typo-tolerant RPC function
      const res = await (supabase.rpc as any)('search_prompts', { search_term: query.trim() })
        .select(`
          *,
          author:profiles!prompts_author_id_fkey(full_name, avatar_url, username),
          prompt_categories!inner(
            categories(name, slug)
          )
        `)
        .limit(20);
      data = res.data;
      error = res.error;
    } else {
      // Fallback to standard select if no search term
      const res = await supabase
        .from('prompts')
        .select(`
          *,
          author:profiles!prompts_author_id_fkey(full_name, avatar_url, username),
          prompt_categories!inner(
            categories(name, slug)
          )
        `)
        .eq('status', 'published')
        .limit(20);
      data = res.data;
      error = res.error;
    }

    if (error) {
      console.error('Error searching prompts:', error);
      return [];
    }
    
    let results = (data as unknown) as any[];
    
    if (categorySlug && categorySlug !== 'all') {
       results = results.filter(p => 
         p.prompt_categories.some((pc: any) => pc.categories.slug === categorySlug)
       );
    }
    
    return results.map(p => ({
      ...p,
      categories: p.prompt_categories.map((pc: any) => pc.categories),
      prompt_categories: undefined 
    })) as PromptWithAuthor[];
  },

  // Fetch prompts by user (both drafts and published)
  async getUserPrompts(userId: string): Promise<PromptWithAuthor[]> {
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        author:profiles!prompts_author_id_fkey(full_name, avatar_url, username),
        prompt_categories(
          categories(name, slug)
        )
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user prompts:', error);
      return [];
    }

    return (data as any[]).map(p => ({
      ...p,
      categories: p.prompt_categories ? p.prompt_categories.map((pc: any) => pc.categories) : [],
      prompt_categories: undefined
    })) as PromptWithAuthor[];
  },

  // Fetch saved prompts
  async getSavedPrompts(userId: string): Promise<PromptWithAuthor[]> {
    const { data, error } = await supabase
      .from('user_likes')
      .select(`
        prompts(
          *,
          author:profiles!prompts_author_id_fkey(full_name, avatar_url, username),
          prompt_categories(
            categories(name, slug)
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching saved prompts:', error);
      return [];
    }

    return (data as any[])
      .map(d => {
        const p = d.prompts;
        if (!p) return null;
        return {
          ...p,
          categories: p.prompt_categories ? p.prompt_categories.map((pc: any) => pc.categories) : [],
          prompt_categories: undefined
        };
      })
      .filter(Boolean) as PromptWithAuthor[];
  },

  // Fetch copied prompts
  async getCopiedPrompts(userId: string): Promise<PromptWithAuthor[]> {
    const { data, error } = await supabase
      .from('user_copies')
      .select(`
        prompts(
          *,
          author:profiles!prompts_author_id_fkey(full_name, avatar_url, username),
          prompt_categories(
            categories(name, slug)
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching copied prompts:', error);
      return [];
    }

    return (data as any[])
      .map(d => {
        const p = d.prompts;
        if (!p) return null;
        return {
          ...p,
          categories: p.prompt_categories ? p.prompt_categories.map((pc: any) => pc.categories) : [],
          prompt_categories: undefined
        };
      })
      .filter(Boolean) as PromptWithAuthor[];
  },

  // Fetch a single prompt by ID
  async getPromptDetails(id: string): Promise<PromptWithAuthor | null> {
    if (!isValidUUID(id)) return null;

    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        author:profiles!prompts_author_id_fkey(full_name, avatar_url, username),
        prompt_categories(
          categories(id, name, slug)
        )
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching prompt details:', error);
      return null;
    }
    
    const p = data as any;
    return {
      ...p,
      categories: p.prompt_categories ? p.prompt_categories.map((pc: any) => pc.categories) : [],
      prompt_categories: undefined
    } as PromptWithAuthor;
  },

  // Fetch related prompts
  async getRelatedPrompts(categoryId: string, excludeId: string, limit = 4): Promise<PromptWithAuthor[]> {
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        author:profiles!prompts_author_id_fkey(full_name, avatar_url, username),
        prompt_categories!inner(category_id)
      `)
      .eq('status', 'published')
      .eq('prompt_categories.category_id', categoryId)
      .neq('id', excludeId)
      .limit(limit);

    if (error) {
      console.error('Error fetching related prompts:', error);
      return [];
    }

    return data as PromptWithAuthor[];
  },

  // Check if a prompt is saved
  async isPromptSaved(userId: string, promptId: string): Promise<boolean> {
    if (!isValidUUID(userId) || !isValidUUID(promptId)) return false;

    const { data } = await supabase
      .from('user_likes')
      .select('user_id')
      .eq('user_id', userId)
      .eq('prompt_id', promptId)
      .maybeSingle();
    return !!data;
  },

  // Toggle save status
  async toggleSavePrompt(userId: string, promptId: string): Promise<boolean> {
    if (!isValidUUID(userId) || !isValidUUID(promptId)) {
      console.error('Invalid UUID in toggleSavePrompt:', { userId, promptId });
      return false;
    }

    // Ensure the user's profile exists in profiles table first to satisfy foreign key constraint
    await (supabase.from('profiles').upsert as any)({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });

    const isSaved = await this.isPromptSaved(userId, promptId);
    
    if (isSaved) {
      const { error } = await supabase
        .from('user_likes')
        .delete()
        .eq('user_id', userId)
        .eq('prompt_id', promptId);
      
      if (error) {
        console.error('Error in toggleSavePrompt DELETE:', error);
        throw error;
      }
      return false;
    } else {
      // Use upsert to gracefully ignore rapid double-clicks (409 Conflict)
      const { error } = await (supabase.from('user_likes').upsert as any)({
        user_id: userId,
        prompt_id: promptId
      }, { onConflict: 'user_id,prompt_id', ignoreDuplicates: true });
      
      if (error) {
        console.error('Error in toggleSavePrompt UPSERT:', error);
        throw error;
      }
      return true;
    }
  },

  // Increment copies count
  async incrementCopyCount(id: string, userId?: string) {
    if (!isValidUUID(id)) return;
    
    const { data } = await supabase.from('prompts').select('copies_count').eq('id', id).maybeSingle();
    if (data) {
      const currentCount = (data as any).copies_count || 0;
      await (supabase.from('prompts').update as any)({ copies_count: currentCount + 1 }).eq('id', id);
    }
    
    // Also track the copy for the user's dashboard if logged in
    if (userId) {
      // Ensure the user's profile exists to satisfy the foreign key constraint
      await (supabase.from('profiles').upsert as any)({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });

      await (supabase.from('user_copies').upsert as any)({
        user_id: userId,
        prompt_id: id
      }, { onConflict: 'user_id,prompt_id', ignoreDuplicates: true });
    }
  },
  
  // Increment view count
  async incrementViewCount(id: string) {
    if (!isValidUUID(id)) return;
    
    const { data } = await supabase.from('prompts').select('views_count').eq('id', id).maybeSingle();
    if (data) {
      const currentCount = (data as any).views_count || 0;
      await (supabase.from('prompts').update as any)({ views_count: currentCount + 1 }).eq('id', id);
    }
  },

  // ── NEW: Profile Update ───────────────────────────────────────────────────────
  async getProfile(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    return data as any;
  },

  async checkUsernameAvailability(username: string): Promise<boolean> {
    if (!username) return false;
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.trim().toLowerCase())
      .limit(1);
      
    if (error) {
      console.error("Error checking username:", error);
      return false; // Assume unavailable on error
    }
    
    // If no rows are returned, the username is available
    return data.length === 0;
  },

  async updateProfile(id: string, updates: { full_name?: string; username?: string }) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id, ...(updates as any) })
      .select()
      .single();

    if (error) {
      // If error is unique constraint violation on username
      if (error.code === '23505' && error.message.includes('username')) {
        throw new Error('Username is already taken.');
      }
      throw error;
    }
    return data;
  },

  // ── NEW: Prompt Upload & Publishing ──────────────────────────────────────────
  async uploadThumbnail(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('prompt-thumbnails')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading thumbnail:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('prompt-thumbnails')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async createPrompt(promptData: Partial<Prompt>, categorySlug: string) {
    // 0. Ensure author profile exists to satisfy foreign key constraint
    if (promptData.author_id) {
      await supabase.from('profiles').upsert({ id: promptData.author_id } as any);
    }

    // 1. Insert prompt
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .insert({
        ...promptData,
      } as any)
      .select()
      .single();

    if (promptError) throw promptError;

    // 2. Fetch category id and name
    const { data: category } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', categorySlug)
      .single();

    if (category && prompt) {
      // 3. Link category and save names for fast identify
      await supabase
        .from('prompt_categories')
        .insert({
          prompt_id: (prompt as any).id,
          category_id: (category as any).id,
          prompt_title: (prompt as any).title,
          category_name: (category as any).name
        } as any);
    }

    return prompt;
  },

  async updatePrompt(id: string, promptData: Partial<Prompt>, categorySlug?: string) {
    // 1. Update the prompt
    const { data: prompt, error: promptError } = await (supabase
      .from('prompts')
      .update as any)(promptData)
      .eq('id', id)
      .select()
      .single();

    if (promptError) throw promptError;

    // 2. Update category if provided
    if (categorySlug && prompt) {
      const { data: category } = await supabase
        .from('categories')
        .select('id, name')
        .eq('slug', categorySlug)
        .single();

      if (category) {
        // Delete old category link
        await supabase
          .from('prompt_categories')
          .delete()
          .eq('prompt_id', id);

        // Insert new category link
        await (supabase
          .from('prompt_categories')
          .insert as any)({
            prompt_id: id,
            category_id: (category as any).id,
            prompt_title: (prompt as any).title,
            category_name: (category as any).name
          });
      }
    }

    return prompt;
  },

  async deletePrompt(id: string) {
    const { error } = await supabase
      .from('prompts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // ── Admin Functions ───────────────────────────────────────────────────────
  async getAllPromptsAdmin(): Promise<PromptWithAuthor[]> {
    const { data, error } = await supabase
      .from('prompts')
      .select(`
        *,
        author:profiles!prompts_author_id_fkey(full_name, avatar_url, username),
        prompt_categories(
          categories(name, slug)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin prompts:', error);
      return [];
    }

    return (data as any[]).map(p => ({
      ...p,
      categories: p.prompt_categories ? p.prompt_categories.map((pc: any) => pc.categories) : [],
      prompt_categories: undefined
    })) as PromptWithAuthor[];
  },

  async getAllUsersAdmin(): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin users:', error);
      return [];
    }
    return data as Profile[];
  }
};
