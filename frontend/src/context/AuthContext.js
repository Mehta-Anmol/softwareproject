import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:5000/api/users/me');
      setUser(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name,
      email,
      password
    });
    return response.data;
  };

  const verifyEmail = async (email, otp) => {
    const response = await axios.post('http://localhost:5000/api/auth/verify-email', {
      email,
      otp
    });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  };

  const resendOTP = async (email) => {
    const response = await axios.post('http://localhost:5000/api/auth/resend-otp', {
      email
    });
    return response.data;
  };

  const login = async (email, password) => {
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email,
      password
    });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Add an axios interceptor to handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Only log out if it's a 401 error and it's not from the auth endpoints
      if (error.response?.status === 401 && 
          !error.config.url.includes('/api/auth/')) {
        logout();
      }
      return Promise.reject(error);
    }
  );

  const value = {
    user,
    loading,
    register,
    verifyEmail,
    resendOTP,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 