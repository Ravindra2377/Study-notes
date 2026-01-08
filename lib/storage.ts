import { supabase } from './supabase';

export interface SavedNote {
    id: string;
    userId: string;
    fileName: string;
    notes: any;
    createdAt: string;
}

export interface UserUsage {
    userId: string;
    documentsProcessed: number;
    isPremium: boolean;
    lastReset: string;
}

export async function saveNote(userId: string, fileName: string, notes: any): Promise<string> {
    if (!supabase) {
        console.error('SaveNote: Supabase client is null');
        throw new Error('Supabase client not initialized. Check server logs for missing variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY).');
    }

    const { data, error } = await supabase
        .from('notes')
        .insert({
            user_id: userId,
            file_name: fileName,
            notes: notes,
        })
        .select()
        .single();

    if (error) throw error;
    return data.id;
}

export async function getNote(noteId: string): Promise<SavedNote | null> {
    if (!supabase) return null;

    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();

    if (error) return null;

    return {
        id: data.id,
        userId: data.user_id,
        fileName: data.file_name,
        notes: data.notes,
        createdAt: data.created_at,
    };
}

export async function getUserUsage(userId: string): Promise<UserUsage> {
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    // Try to get existing user
    let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();

    // If user doesn't exist, create them
    if (error || !data) {
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert({
                user_id: userId,
                documents_processed: 0,
                is_premium: false,
            })
            .select()
            .single();

        if (insertError) throw insertError;
        data = newUser;
    }

    // Check if we need to reset monthly counter
    const lastReset = new Date(data.last_reset);
    const now = new Date();

    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
        const { data: updated } = await supabase
            .from('users')
            .update({
                documents_processed: 0,
                last_reset: now.toISOString(),
            })
            .eq('user_id', userId)
            .select()
            .single();

        data = updated || data;
    }

    return {
        userId: data.user_id,
        documentsProcessed: data.documents_processed,
        isPremium: data.is_premium,
        lastReset: data.last_reset,
    };
}

export async function incrementUsage(userId: string): Promise<void> {
    if (!supabase) return;

    const usage = await getUserUsage(userId);
    await supabase
        .from('users')
        .update({ documents_processed: usage.documentsProcessed + 1 })
        .eq('user_id', userId);
}

export async function upgradeToPremium(userId: string): Promise<void> {
    if (!supabase) {
        throw new Error('Supabase client not initialized');
    }

    const { error } = await supabase
        .from('users')
        .update({ is_premium: true })
        .eq('user_id', userId);

    if (error) throw error;
}
