// Versão especial para deploy no Vercel
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// Lista de emails autorizados (hardcoded para Vercel)
const AUTHORIZED_EMAILS = [
  'crisnabto@gmail.com',
  'aullus.88@gmail.com'
]

// Função para verificar se o usuário está autorizado (versão Vercel)
export function isEmailAuthorized(email: string): boolean {
  return AUTHORIZED_EMAILS.includes(email.toLowerCase())
}

// Hook especial para deploy no Vercel
export function useVercelAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isUnauthorized, setIsUnauthorized] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        // Verificar se o usuário está autorizado (versão local)
        const isAuthorized = isEmailAuthorized(session.user.email || '')
        if (!isAuthorized) {
          // Fazer logout se não autorizado
          console.log('User not authorized, signing out')
          setSession(null)
          setUser(null)
          setIsUnauthorized(true)
          setLoading(false)
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
          // Verificar autorização no login (versão local)
          const isAuthorized = isEmailAuthorized(session.user.email || '')
          if (!isAuthorized) {
            // Fazer logout se não autorizado
            console.log('User not authorized after login, signing out')
            setSession(null)
            setUser(null)
            setIsUnauthorized(true)
            setLoading(false)
            await supabase.auth.signOut()
            return
          }
        }
        
        // Se não há sessão ou usuário, apenas resetar se não estivermos em estado não autorizado
        if (!session || !session.user) {
          setIsUnauthorized(false)
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
      })
      if (error) throw error
    } catch (error) {
      console.error('Erro no cadastro:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Erro no logout:', error)
      throw error
    }
  }

  return {
    user,
    session,
    loading,
    isUnauthorized,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut
  }
}