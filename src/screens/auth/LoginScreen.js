import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { authService } from '../../services/authService';
import { spamProtection } from '../../utils/spamProtection';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Configure Google Sign In
    GoogleSignin.configure({
      webClientId: 'your-web-client-id.googleusercontent.com',
    });

    // Animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Check if user is blocked
    checkSpamProtection();
    generateCaptcha();
  }, []);

  const checkSpamProtection = async () => {
    const deviceId = await DeviceInfo.getUniqueId();
    const spamStatus = await spamProtection.checkLoginAttempts(deviceId);
    
    if (spamStatus.isBlocked) {
      setIsBlocked(true);
      setBlockTimeRemaining(spamStatus.remainingTime);
      startCountdown(spamStatus.remainingTime);
    }

    if (spamStatus.attempts >= 3) {
      setCaptchaRequired(true);
    }
  };

  const startCountdown = (seconds) => {
    const interval = setInterval(() => {
      seconds -= 1;
      setBlockTimeRemaining(seconds);
      
      if (seconds <= 0) {
        clearInterval(interval);
        setIsBlocked(false);
        setLoginAttempts(0);
        setCaptchaRequired(false);
      }
    }, 1000);
  };

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCaptcha(result);
  };

  const validateInput = () => {
    if (!formData.username.trim()) {
      Alert.alert('Error', 'Please enter username or email');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Error', 'Please enter password');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }
    if (captchaRequired && captchaCode !== generatedCaptcha) {
      Alert.alert('Error', 'Invalid captcha code');
      generateCaptcha();
      setCaptchaCode('');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (isBlocked) {
      Alert.alert('Account Temporarily Blocked', 
        `Too many failed attempts. Try again in ${Math.ceil(blockTimeRemaining / 60)} minutes.`);
      return;
    }

    if (!validateInput()) return;

    setLoading(true);
    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const deviceInfo = {
        deviceId,
        model: await DeviceInfo.getModel(),
        systemVersion: await DeviceInfo.getSystemVersion(),
        appVersion: await DeviceInfo.getVersion(),
        ipAddress: await DeviceInfo.getIpAddress(),
      };

      // Check spam protection before login
      const spamCheck = await spamProtection.validateLoginAttempt(deviceId);
      if (!spamCheck.allowed) {
        setIsBlocked(true);
        setBlockTimeRemaining(spamCheck.blockTime);
        startCountdown(spamCheck.blockTime);
        Alert.alert('Too Many Attempts', 'Please wait before trying again');
        return;
      }

      const response = await authService.login({
        username: formData.username,
        password: formData.password,
        deviceInfo,
        captcha: captchaRequired ? captchaCode : null
      });

      if (response.success) {
        await AsyncStorage.setItem('authToken', response.token);
        await AsyncStorage.setItem('userId', response.user.id);
        await AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
        
        // Reset spam protection on successful login
        await spamProtection.resetLoginAttempts(deviceId);
        
        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    } catch (error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setCaptchaRequired(true);
        generateCaptcha();
      }

      if (newAttempts >= 5) {
        const deviceId = await DeviceInfo.getUniqueId();
        await spamProtection.blockDevice(deviceId, 900); // 15 minutes
        setIsBlocked(true);
        setBlockTimeRemaining(900);
        startCountdown(900);
      }

      Alert.alert('Login Failed', 
        error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      const response = await authService.googleLogin({
        googleId: userInfo.user.id,
        email: userInfo.user.email,
        name: userInfo.user.name,
        photo: userInfo.user.photo,
      });

      if (response.success) {
        await AsyncStorage.setItem('authToken', response.token);
        await AsyncStorage.setItem('userId', response.user.id);
        await AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
        
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    } catch (error) {
      Alert.alert('Google Sign In Failed', error.message);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <Animated.View 
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#E1306C', '#F77737', '#FCAF45']}
              style={styles.logoGradient}
            >
              <Icon name="photo-camera" size={50} color="#fff" />
            </LinearGradient>
            <Text style={styles.logoText}>Instagram Clone</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Icon name="person" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username or Email"
                placeholderTextColor="#999"
                value={formData.username}
                onChangeText={(text) => setFormData({...formData, username: text})}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isBlocked}
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={formData.password}
                onChangeText={(text) => setFormData({...formData, password: text})}
                secureTextEntry={!showPassword}
                editable={!isBlocked}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon 
                  name={showPassword ? 'visibility-off' : 'visibility'} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>
            </View>

            {/* Captcha */}
            {captchaRequired && (
              <View style={styles.captchaContainer}>
                <View style={styles.captchaBox}>
                  <Text style={styles.captchaText}>{generatedCaptcha}</Text>
                  <TouchableOpacity onPress={generateCaptcha}>
                    <Icon name="refresh" size={20} color="#666" />
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.captchaInput}
                  placeholder="Enter captcha"
                  value={captchaCode}
                  onChangeText={setCaptchaCode}
                  maxLength={5}
                />
              </View>
            )}

            {/* Block Warning */}
            {isBlocked && (
              <View style={styles.warningContainer}>
                <Icon name="warning" size={20} color="#ff4444" />
                <Text style={styles.warningText}>
                  Account blocked for {Math.ceil(blockTimeRemaining / 60)} minutes
                </Text>
              </View>
            )}

            {/* Login Attempts Warning */}
            {loginAttempts > 0 && !isBlocked && (
              <Text style={styles.attemptsWarning}>
                {5 - loginAttempts} attempts remaining
              </Text>
            )}

            <TouchableOpacity
              style={[styles.loginButton, (loading || isBlocked) && styles.disabledButton]}
              onPress={handleLogin}
              disabled={loading || isBlocked}
            >
              <LinearGradient
                colors={['#E1306C', '#F77737']}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.loginButtonText}>Log In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Social Login */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              disabled={loading || isBlocked}
            >
              <Icon name="google" size={20} color="#db4437" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  captchaContainer: {
    marginBottom: 15,
  },
  captchaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  captchaText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 5,
    color: '#333',
  },
  captchaInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 3,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  warningText: {
    color: '#ff4444',
    marginLeft: 10,
    fontSize: 14,
  },
  attemptsWarning: {
    color: '#ff6600',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#E1306C',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#666',
    fontSize: 14,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 20,
  },
  googleButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: '#666',
    fontSize: 14,
  },
  signupLink: {
    color: '#E1306C',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;