"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

interface User {
  email: string;
  surname?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, surname: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ email: payload.email, surname: payload.surname });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  const login = async (email: string, surname: string) => {
    try {
      console.log('🔍 DEBUG - Starting login process...');
      console.log('📧 Email:', email);
      console.log('👤 Surname:', surname);
      
      const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/committee/login`;
    //   'http://localhost:5000/api/committee/login';
      console.log('🌐 API URL:', API_URL);

      const requestData = { email, surname };
      console.log('📦 Request data:', JSON.stringify(requestData, null, 2));

      const response = await axios.post(API_URL, requestData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
        validateStatus: function (status) {
          return status >= 200 && status < 500; // Resolve only if the status code is less than 500
        }
      });

      console.log('✅ Backend response received');
      console.log('📊 Response status:', response.status);
      console.log('📄 Response headers:', response.headers);
      console.log('💾 Response data:', JSON.stringify(response.data, null, 2));

      // Check if we got a successful response with token
      if (response.data.token) {
        console.log('🎉 Login successful - token found');
        localStorage.setItem('token', response.data.token);
        setUser({ 
          email: response.data.user?.email || response.data.committee?.email || email, 
          surname: response.data.user?.surname || surname 
        });
        setIsAuthenticated(true);
        return;
      }

      // Check for success flag with token
      if (response.data.success && response.data.token) {
        console.log('🎉 Login successful - success flag with token');
        localStorage.setItem('token', response.data.token);
        setUser({ 
          email: response.data.user?.email || email, 
          surname: response.data.user?.surname || surname 
        });
        setIsAuthenticated(true);
        return;
      }

      // If we get here but status is 200, check what we actually received
      if (response.status === 200) {
        console.warn('⚠️ Status 200 but no token structure:', response.data);
        throw new Error(`Unexpected response format: ${JSON.stringify(response.data)}`);
      }

      // Handle error responses
      if (response.data.msg) {
        throw new Error(response.data.msg);
      }

      if (response.data.message) {
        throw new Error(response.data.message);
      }

      // Generic error if no specific message
      throw new Error(`Login failed with status ${response.status}`);

    } catch (error: unknown) {
      console.error('🚨 COMPLETE ERROR DETAILS:');
      if (axios.isAxiosError(error)) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        
        if (error.response) {
          console.error('Response status:', error.response.status);
          console.error('Response data:', error.response.data);
          console.error('Response headers:', error.response.headers);
          
          if (error.response.data) {
            throw new Error(error.response.data.msg || error.response.data.message || `Server error: ${error.response.status}`);
          }
        } else if (error.request) {
          console.error('No response received:', error.request);
          throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
        } else {
          console.error('Error setting up request:', error.message);
          throw new Error(error.message || 'Login failed');
        }
      } else if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        throw new Error(error.message || 'Login failed');
      } else {
        console.error('Unknown error:', error);
        throw new Error('Login failed. Please try again.');
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};