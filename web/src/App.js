import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import GamesPage from './pages/GamesPage';
import StakingPage from './pages/StakingPage';
import PaymentPage from './pages/PaymentPage';
import SubscriptionPage from './pages/SubscriptionPage';
import AdminPanel from './pages/AdminPanel';
import LoadingScreen from './components/LoadingScreen';

// Services
import { authService } from './services/authService';
import { useAuthStore } from './stores/authStore';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', sans-serif;
`;

const MainContent = styled.div`
  display: flex;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ContentArea = styled.main`
  flex: 1;
  margin-left: ${props => props.sidebarOpen ? '250px' : '60px'};
  transition: margin-left 0.3s ease;
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding-bottom: 60px;
  }
`;

function App() {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, setUser, isAuthenticated, setIsAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const isValid = await authService.verifyToken(token);
        if (isValid) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userInfo', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
        toast.success('Welcome back!');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
      return { success: false, error: error.message };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('userInfo', JSON.stringify(response.user));
        setUser(response.user);
        setIsAuthenticated(true);
        toast.success('Account created successfully!');
        return { success: true };
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AppContainer>
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route 
                path="/login" 
                element={<LoginPage onLogin={handleLogin} />} 
              />
              <Route 
                path="/register" 
                element={<RegisterPage onRegister={handleRegister} />} 
              />
              <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MainContent>
              <Navbar 
                user={user} 
                onLogout={handleLogout}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
              <Sidebar 
                isOpen={sidebarOpen} 
                user={user}
              />
              <ContentArea sidebarOpen={sidebarOpen}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/profile/:username?" element={<ProfilePage />} />
                  <Route path="/chat/:chatId?" element={<ChatPage />} />
                  <Route path="/games" element={<GamesPage />} />
                  <Route path="/staking" element={<StakingPage />} />
                  <Route path="/payment" element={<PaymentPage />} />
                  <Route path="/subscription" element={<SubscriptionPage />} />
                  {user?.role === 'admin' && (
                    <Route path="/admin/*" element={<AdminPanel />} />
                  )}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </ContentArea>
            </MainContent>
          </motion.div>
        )}
      </AnimatePresence>
    </AppContainer>
  );
}

export default App;