import { useState, useEffect } from 'react';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string | null;
}

export function useUser(initialUser?: User | null) {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [loading, setLoading] = useState(!initialUser);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    if (initialUser) {
      setUser(initialUser);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/session', {
        credentials: 'same-origin',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const session = await response.json();
        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.name || '',
            email: session.user.email || '',
            avatar_url: session.user.avatar_url
          });
        } else {
          setUser(null);
        }
      } else if (response.status === 401) {
        setUser(null);
        setError('Sessão expirada');
      } else {
        setError('Erro ao carregar dados do usuário');
      }
    } catch (err) {
      console.error('Erro ao buscar dados do usuário:', err);
      setError('Erro de conexão');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Atualizar quando initialUser mudar
  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setLoading(false);
    }
  }, [initialUser]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
    setUser
  };
} 