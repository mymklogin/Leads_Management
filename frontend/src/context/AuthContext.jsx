import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('lead_mgmt_token') || null);
  const [allowedMenus, setAllowedMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('lead_mgmt_user');
    const savedMenus = localStorage.getItem('lead_mgmt_menus');

    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
        if (savedMenus) {
          setAllowedMenus(JSON.parse(savedMenus));
        }
        // Fetch fresh menus from backend
        fetchFreshMenus();
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const fetchFreshMenus = async () => {
    try {
      const res = await api.get('/menus/my-menus');
      if (res.data) {
        setAllowedMenus(res.data);
        localStorage.setItem('lead_mgmt_menus', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error('Failed to fetch fresh dynamic menus', err);
    }
  };

  const login = async (usernameOrEmail, password) => {
    const response = await api.post('/auth/login', {
      usernameOrEmail,
      password
    });

    const { token: jwtToken, user: userProfile, allowedMenus: menus } = response.data;

    setToken(jwtToken);
    setUser(userProfile);
    setAllowedMenus(menus);

    localStorage.setItem('lead_mgmt_token', jwtToken);
    localStorage.setItem('lead_mgmt_user', JSON.stringify(userProfile));
    localStorage.setItem('lead_mgmt_menus', JSON.stringify(menus));

    return response.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAllowedMenus([]);
    localStorage.removeItem('lead_mgmt_token');
    localStorage.removeItem('lead_mgmt_user');
    localStorage.removeItem('lead_mgmt_menus');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      allowedMenus,
      isAuthenticated: !!token,
      login,
      logout,
      refreshMenus: fetchFreshMenus,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
