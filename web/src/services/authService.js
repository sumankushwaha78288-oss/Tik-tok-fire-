import axios from 'axios';
import CryptoJS from 'crypto-js';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // Request interceptor
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Encrypt sensitive data
  encryptData(data) {
    const secretKey = process.env.REACT_APP_ENCRYPTION_KEY || 'default-secret-key';
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  }

  // Decrypt sensitive data
  decryptData(encryptedData) {
    const secretKey = process.env.REACT_APP_ENCRYPTION_KEY || 'default-secret-key';
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  async login(credentials) {
    try {
      const response = await this.api.post('/auth/login', {
        username: credentials.username,
        password: this.encryptData(credentials.password),
        deviceFingerprint: credentials.deviceFingerprint,
        captcha: credentials.captcha,
        timestamp: Date.now(),
      });

      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        code: error.response?.data?.code,
      };
    }
  }

  async register(userData) {
    try {
      const response = await this.api.post('/auth/register', {
        fullName: userData.fullName,
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        password: this.encryptData(userData.password),
        verificationCode: userData.verificationCode,
        deviceFingerprint: userData.deviceFingerprint,
        captcha: userData.captcha,
        timestamp: Date.now(),
      });

      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
      };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        code: error.response?.data?.code,
      };
    }
  }

  async sendEmailVerification(email) {
    try {
      const response = await this.api.post('/auth/send-verification', {
        email,
        type: 'registration',
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to send verification email',
      };
    }
  }

  async verifyToken(token) {
    try {
      const response = await this.api.get('/auth/verify-token', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.valid;
    } catch (error) {
      return false;
    }
  }

  async getCurrentUser() {
    try {
      const response = await this.api.get('/auth/me');
      return response.data.user;
    } catch (error) {
      const userInfo = localStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    }
  }

  async logout() {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userInfo');
    }
  }

  async forgotPassword(email) {
    try {
      const response = await this.api.post('/auth/forgot-password', { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email',
      };
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const response = await this.api.post('/auth/reset-password', {
        token,
        password: this.encryptData(newPassword),
      });
      return { success: true, message: response.data.message };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Password reset failed',
      };
    }
  }
}

export const authService = new AuthService();