
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'planner' | 'volunteer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  isPlanner: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch the user's profile from Supabase
          const { data, error } = await supabase
            .from('profiles')
            .select('name, role')
            .eq('id', session.user.id)
            .single();

          if (data) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: data.name,
              role: data.role as UserRole,
            });
          } else if (error) {
            console.error('Error fetching profile:', error);
          }
        } else {
          setUser(null);
        }
      }
    );

    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch the user's profile from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', session.user.id)
          .single();

        if (data) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: data.name,
            role: data.role as UserRole,
          });
        } else {
          console.error('Error fetching profile:', error);
        }
      }
      
      setLoading(false);
    };

    checkSession();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast({
        title: "Logged in successfully",
        description: `Welcome back!`
      });
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Registration successful",
        description: "Welcome to Worship Planner!"
      });
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully."
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: (error as Error).message
      });
    }
  };

  const isAdmin = () => user?.role === 'admin';
  const isPlanner = () => ['admin', 'planner'].includes(user?.role || '');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAdmin,
        isPlanner,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
