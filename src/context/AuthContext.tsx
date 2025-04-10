
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';

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

// Mock user data since we don't have Supabase yet
const mockUsers = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin' as UserRole,
  },
  {
    id: '2',
    email: 'planner@example.com',
    password: 'planner123',
    name: 'Planner User',
    role: 'planner' as UserRole,
  },
  {
    id: '3',
    email: 'volunteer@example.com',
    password: 'volunteer123',
    name: 'Volunteer User',
    role: 'volunteer' as UserRole,
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('worshipPlanner_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('worshipPlanner_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Mock authentication
      const foundUser = mockUsers.find(
        (u) => u.email === email && u.password === password
      );
      
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        localStorage.setItem('worshipPlanner_user', JSON.stringify(userWithoutPassword));
        toast({
          title: "Logged in successfully",
          description: `Welcome back, ${userWithoutPassword.name}!`
        });
      } else {
        throw new Error('Invalid email or password');
      }
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
      // Check if user already exists
      if (mockUsers.some((u) => u.email === email)) {
        throw new Error('User with this email already exists');
      }
      
      // In a real implementation, we would create the user in Supabase
      // For now, we'll just mock it and add to our array
      const newUser = {
        id: `${mockUsers.length + 1}`,
        email,
        password,
        name,
        role: 'volunteer' as UserRole,
      };
      
      mockUsers.push(newUser);
      
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem('worshipPlanner_user', JSON.stringify(userWithoutPassword));
      
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('worshipPlanner_user');
    toast({
      title: "Logged out",
      description: "You have been logged out successfully."
    });
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
