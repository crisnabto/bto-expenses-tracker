// Fallback para quando o Supabase não está disponível no build
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qsbxwyjulqlfeeftixrn.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzYnh3eWp1bHFsZmVlZnRpeHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjMxMjMzMjcsImV4cCI6MjAzODY5OTMyN30.YJPNpCn-CaVqrFQIQzIGJANJFfgZCDgWo6kQlPOJoFQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})