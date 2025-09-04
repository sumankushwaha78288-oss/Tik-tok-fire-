import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import CryptoJS from 'crypto-js';

const API_BASE_URL = 'https://your-api-domain.com/api'; // Replace with your API URL

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  // Encrypt sensitive data
  encryptData(data) {
    const secretKey = 'your-secret-key'; // Use environment variable in production
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  }

  // Decrypt sensitive data
  decryptData(encryptedData) {
    const secretKey = 'your-secret-key';
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  }

  // Generate device fingerprint for security
  async generateDeviceFingerprint() {
    const deviceInfo = {
      deviceId: await DeviceInfo.getUniqueId(),
      model: await DeviceInfo.getModel(),
      systemName: await DeviceInfo.getSystemName(),
      systemVersion: await DeviceInfo.getSystemVersion(),
      appVersion: await DeviceInfo.getVersion(),
      buildNumber: await DeviceInfo.getBuildNumber(),
      bundleId: await DeviceInfo.getBundleId(),
      carrier: await DeviceInfo.getCarrier(),
      timezone: await DeviceInfo.getTimezone(),
    };

    return CryptoJS.SHA256(JSON.stringify(deviceInfo)).toString();
  }

  async login(credentials) {
    try {
      const deviceFingerprint = await this.generateDeviceFingerprint();
      const encryptedPassword = this.encryptData(credentials.password);

      const response = await this.api.post('/auth/login', {
        username: credentials.username,
        password: encryptedPassword,
        deviceInfo: credentials.deviceInfo,
        deviceFingerprint,
        captcha: credentials.captcha,
        timestamp: Date.now(),
      });

      if (response.data.success) {
        // Store authentication data
        await AsyncStorage.multiSet([
          ['authToken', response.data.token],
          ['refreshToken', response.data.refreshToken],
          ['userId', response.data.user.id],
          ['userInfo', JSON.stringify(response.data.user)],
          ['loginTime', Date.now().toString()],
        ]);

        // Track successful login
        await this.trackLoginEvent('success', credentials.deviceInfo);

        return {
          success: true,
          token: response.data.token,
          user: response.data.user,
        };
      }
    } catch (error) {
      // Track failed login
      await this.trackLoginEvent('failed', credentials.deviceInfo, error.message);
      
      throw {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        code: error.response?.data?.code,
      };
    }
  }

  async register(userData) {
    try {
      const deviceFingerprint = await this.generateDeviceFingerprint();
      const encryptedPassword = this.encryptData(userData.password);

      const response = await this.api.post('/auth/register', {
        fullName: userData.fullName,
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        password: encryptedPassword,
        verificationCode: userData.verificationCode,
        deviceInfo: userData.deviceInfo,
        deviceFingerprint,
        captcha: userData.captcha,
        timestamp: Date.now(),
      });

      if (response.data.success) {
        // Store authentication data
        await AsyncStorage.multiSet([
          ['authToken', response.data.token],
          ['refreshToken', response.data.refreshToken],
          ['userId', response.data.user.id],
          ['userInfo', JSON.stringify(response.data.user)],
          ['loginTime', Date.now().toString()],
        ]);

        // Track successful registration
        await this.trackRegistrationEvent('success', userData.deviceInfo);

        return {
          success: true,
          token: response.data.token,
          user: response.data.user,
        };
      }
    } catch (error) {
      // Track failed registration
      await this.trackRegistrationEvent('failed', userData.deviceInfo, error.message);
      
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

  async googleLogin(googleData) {
    try {
      const deviceFingerprint = await this.generateDeviceFingerprint();
      
      const response = await this.api.post('/auth/google-login', {
        ...googleData,
        deviceFingerprint,
        timestamp: Date.now(),
      });

      if (response.data.success) {
        await AsyncStorage.multiSet([
          ['authToken', response.data.token],
          ['refreshToken', response.data.refreshToken],
          ['userId', response.data.user.id],
          ['userInfo', JSON.stringify(response.data.user)],
          ['loginTime', Date.now().toString()],
        ]);

        return {
          success: true,
          token: response.data.token,
          user: response.data.user,
        };
      }
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Google login failed',
      };
    }
  }

  async googleRegister(googleData) {
    try {
      const deviceFingerprint = await this.generateDeviceFingerprint();
      
      const response = await this.api.post('/auth/google-register', {
        ...googleData,
        deviceFingerprint,
        timestamp: Date.now(),
      });

      if (response.data.success) {
        await AsyncStorage.multiSet([
          ['authToken', response.data.token],
          ['refreshToken', response.data.refreshToken],
          ['userId', response.data.user.id],
          ['userInfo', JSON.stringify(response.data.user)],
          ['loginTime', Date.now().toString()],
        ]);

        return {
          success: true,
          token: response.data.token,
          user: response.data.user,
        };
      }
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Google registration failed',
      };
    }
  }

  async logout() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        await this.api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear all stored data
      await AsyncStorage.multiRemove([
        'authToken',
        'refreshToken',
        'userId',
        'userInfo',
        'loginTime',
      ]);
    }
  }

  async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.api.post('/auth/refresh', {
        refreshToken,
      });

      if (response.data.success) {
        await AsyncStorage.setItem('authToken', response.data.token);
        return response.data.token;
      }
    } catch (error) {
      await this.logout();
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      const response = await this.api.post('/auth/forgot-password', {
        email,
      });

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
      const encryptedPassword = this.encryptData(newPassword);
      
      const response = await this.api.post('/auth/reset-password', {
        token,
        password: encryptedPassword,
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Password reset failed',
      };
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const encryptedCurrentPassword = this.encryptData(currentPassword);
      const encryptedNewPassword = this.encryptData(newPassword);

      const response = await this.api.post('/auth/change-password', {
        currentPassword: encryptedCurrentPassword,
        newPassword: encryptedNewPassword,
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Password change failed',
      };
    }
  }

  async verifyEmail(code) {
    try {
      const response = await this.api.post('/auth/verify-email', {
        code,
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      throw {
        success: false,
        message: error.response?.data?.message || 'Email verification failed',
      };
    }
  }

  async trackLoginEvent(status, deviceInfo, error = null) {
    try {
      await this.api.post('/auth/track-login', {
        status,
        deviceInfo,
        error,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to track login event:', error);
    }
  }

  async trackRegistrationEvent(status, deviceInfo, error = null) {
    try {
      await this.api.post('/auth/track-registration', {
        status,
        deviceInfo,
        error,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to track registration event:', error);
    }
  }

  async checkAuthStatus() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return false;

      const response = await this.api.get('/auth/verify-token');
      return response.data.valid;
    } catch (error) {
      await this.logout();
      return false;
    }
  }

  async getCurrentUser() {
    try {
      const userInfo = await AsyncStorage.getItem('userInfo');
      return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
      return null;
    }
  }
}

export const authService = new AuthService();