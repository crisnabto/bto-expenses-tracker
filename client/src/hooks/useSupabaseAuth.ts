import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Função para verificar se o usuário está autorizado
async function checkUserAuthorization(email: string): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/check-authorization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
    
    if (!response.ok) {
      console.error('Authorization check failed:', response.status)
      return false
    }
    
    const data = await response.json()
    return data.authorized === true
  } catch (error) {
    console.error('Error checking authorization:', error)
    // Em caso de erro de rede, permitir acesso temporariamente
    return true
  }
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUnauthorized, setIsUnauthorized] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Verificar se o usuário está autorizado
        const isAuthorized = await checkUserAuthorization(session.user.email || '')
        if (!isAuthorized) {
          // Fazer logout se não autorizado
          console.log('User not authorized, signing out')
          setSession(null)
          setUser(null)
          setIsUnauthorized(true)
          setLoading(false)
          // Fazer logout após definir o estado
          await supabase.auth.signOut()
          return
        }
      }
      setSession(session)
      setUser(session?.user ?? null)
      setIsUnauthorized(false)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          // Verificar autorização no login
          const isAuthorized = await checkUserAuthorization(session.user.email || '')
          if (!isAuthorized) {
            // Fazer logout se não autorizado
            console.log('User not authorized after login, signing out')
            setSession(null)
            setUser(null)
            setIsUnauthorized(true)
            setLoading(false)
            // Fazer logout após definir o estado
            await supabase.auth.signOut()
            return
          }
        }
        
        // Se não há sessão ou usuário, apenas resetar se não estivermos em estado não autorizado
        if (!session || !session.user) {
          setSession(null)
          setUser(null)
          setLoading(false)
          // Não resetar isUnauthorized se já estiver definido
          return
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        setIsUnauthorized(false)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    session,
    loading,
    isUnauthorized,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  }
}