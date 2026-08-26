import type { User } from '@supabase/supabase-js'
import { supabase } from './supabase'

export async function currentUser(): Promise<User | null> { if (!supabase) return null; const { data } = await supabase.auth.getUser(); return data.user }
export async function signIn(email: string, password: string) { if (!supabase) throw new Error('Supabase is not configured.'); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error }
export async function signUp(email: string, password: string) { if (!supabase) throw new Error('Supabase is not configured.'); const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } }); if (error) throw error }
export async function signOut() { if (!supabase) return; await supabase.auth.signOut() }
