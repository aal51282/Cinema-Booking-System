// AuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/services/baseAPI';
import {jwtDecode} from 'jwt-decode'; // Note: Removed curly braces
import { User, CardInformation } from '@/util/types';
// Removed useNavigate import since it's incorrectly used

interface AuthContextType {
  user: User | null;
  login: (loginData: { email: string; password: string; rememberMe: boolean }) => Promise<void>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
  isAuthenticated: boolean;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  fetchPaymentMethods: () => Promise<CardInformation[] | undefined>;
  addCard: (card: CardInformation) => Promise<any>;
  updateCard: (cardId: number, updatedCard: CardInformation) => Promise<void>;
  deleteCard: (cardId: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Setup api interceptor
  useEffect(() => {
    const interceptor = api.interceptors.request.use(
      (config) => {
        let token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, []);

  // On app initialization, check if a token exists
  useEffect(() => {
    let token = sessionStorage.getItem('token') || localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decodedToken.exp < currentTime) {
          // Token has expired
          logout();
        } else {
          setIsAuthenticated(true);
          // Fetch user data from the backend
          fetchUserData(decodedToken.userId);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        logout();
      }
    }
  }, []);

  const fetchUserData = async (userId: number) => {
    try {
      const response = await api.get(`http://localhost:3000/api/users/${userId}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      logout();
    }
  };

  const login = async (loginData: { email: string; password: string; rememberMe: boolean }) => {
    try {
      const response = await api.post('http://localhost:3000/api/auth/login', {
        email: loginData.email,
        password: loginData.password,
      });
      if (response.data.success) {
        const { token } = response.data;
        setIsAuthenticated(true);

        // Store token based on rememberMe
        if (loginData.rememberMe) {
          localStorage.setItem('token', token);
        } else {
          sessionStorage.setItem('token', token);
        }

        // Decode the token to get userId
        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.userId;

        // Fetch user data from the backend
        await fetchUserData(userId);
      } else {
        console.error('Login failed:', response.data.message);
        alert('Incorrect Password!');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Incorrect Password!');
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
  };

  const updateUser = async (updatedData: Partial<User>) => {
    if (!user) {
      console.error('No user is currently logged in.');
      return;
    }

    const dataToSend = { ...updatedData };
    if (dataToSend.billingAddress)
      dataToSend.billingAddress = JSON.stringify(dataToSend.billingAddress);

    try {
      const userId = user.userId;
      const response = await api.put(
        `http://localhost:3000/api/users/${userId}`,
        dataToSend
      );

      if (response.status === 200 || response.status === 201) {
        // Update the user state with the new data
        setUser((prevUser) => ({
          ...prevUser!,
          ...updatedData,
        }));
      } else {
        console.error('Failed to update user:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    if (!user) {
      console.error('No user is currently logged in.');
      throw new Error('User not authenticated');
    }

    try {
      const response = await api.post('http://localhost:3000/api/users/change-password', {
        oldPassword,
        newPassword,
        user,
      });

      if (response.status === 200) {
        alert('Password changed successfully');
      } else {
        console.error('Failed to change password:', response.data.message);
        throw new Error(response.data.message || 'Failed to change password');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.response && error.response.data && error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('An error occurred while changing the password.');
      }
    }
  };

  // Card functions
  const fetchPaymentMethods = async (): Promise<CardInformation[] | undefined> => {
    if (!user) return;
    try {
      const response = await api.get(
        `http://localhost:3000/api/payments/${user.userId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const addCard = async (card: CardInformation) => {
    try {
      const res = await api.post(`http://localhost:3000/api/payments/${user?.userId}`, {
        ...card,
        userId: user?.userId,
      });
      fetchPaymentMethods(); // Refresh list
      return res.data;
    } catch (error) {
      console.error('Error adding card:', error);
      throw error;
    }
  };

  const updateCard = async (cardId: number, updatedCard: CardInformation) => {
    try {
      await api.put(
        `http://localhost:3000/api/payments/${user?.userId}/${cardId}`,
        updatedCard
      );
      fetchPaymentMethods(); // Refresh list
    } catch (error) {
      console.error('Error updating card:', error);
    }
  };

  const deleteCard = async (cardId: number) => {
    try {
      await api.delete(
        `http://localhost:3000/api/payments/${user?.userId}/${cardId}`
      );
      fetchPaymentMethods(); // Refresh list
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated,
        changePassword,
        fetchPaymentMethods,
        addCard,
        updateCard,
        deleteCard,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
