import React, { useState, createContext, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser(JSON.parse(localStorage.getItem('user')));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password
      });
      
      if (response.data.message === 'Logged in successfully') {
        setUser(response.data.user);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setError('');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 
                         error.response?.data?.message || 
                         'An error occurred during login';
      setError(errorMessage);
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        username,
        email,
        password
      });
      
      if (!response.data.success) {
        setError(response.data.error || response.data.message);
        return { error: response.data.error || response.data.message };
      }
      
      setError('');
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.error || error.response?.data?.message || 'An error occurred during registration');
      return { error: error.response?.data?.error || error.response?.data?.message || 'An error occurred during registration' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setError('');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
