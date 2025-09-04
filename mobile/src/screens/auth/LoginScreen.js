import React, {useState, useRef, useEffect} from 'react';
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
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import Animated as RNAnimated from 'react-native-reanimated';
import * as Animatable from 'react-native-animatable';
import HapticFeedback from 'react-native-haptic-feedback';

// Services & Utils
import {authService} from '../../services/authService';
import {spamProtection} from '../../utils/spamProtection';
import {validation} from '../../utils/validation';
import {biometricAuth} from '../../utils/biometricAuth';

// Context
import {useAuth} from '../../context/AuthContext';

const {width, height} = Dimensions.get('window');

const LoginScreen = ({navigation}) => {
  const {login} = useAuth();
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
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    initializeScreen();
    animateScreen();
  }, []);

  const initializeScreen = async () => {
    // Check biometric availability
    const isBiometricAvailable = await biometricAuth.isBiometricAvailable();
    setBiometricAvailable(isBiometricAvailable);

    // Check spam protection
    await checkSpamProtection();
    
    // Generate captcha
    generateCaptcha();

    // Check for saved credentials
    await checkSavedCredentials();
  };

  const animateScreen = () => {
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
  };

  const checkSpamProtection = async () => {
    try {
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
    } catch (error) {
      console.error('Spam protection check failed:', error);
    }
  };

  const checkSavedCredentials = async () => {
    try {
      const savedUsername = await AsyncStorage.getItem('savedUsername');
      const rememberMe = await AsyncStorage.getItem('rememberMe');
      
      if (savedUsername && rememberMe === 'true') {
        setFormData(prev => ({...prev, username: savedUsername}));
      }
    } catch (error) {
      console.error('Error checking saved credentials:', error);
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
      HapticFeedback.trigger('notificationError');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Error', 'Please enter password');
      HapticFeedback.trigger('notificationError');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      HapticFeedback.trigger('notificationError');
      return false;
    }
    if (captchaRequired && captchaCode !== generatedCaptcha) {
      Alert.alert('Error', 'Invalid captcha code');
      generateCaptcha();
      setCaptchaCode('');
      HapticFeedback.trigger('notificationError');
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (isBlocked) {
      Alert.alert(
        'Account Temporarily Blocked',
        `Too many failed attempts. Try again in ${Math.ceil(blockTimeRemaining / 60)} minutes.`
      );
      HapticFeedback.trigger('notificationError');
      return;
    }

    if (!validateInput()) return;

    setLoading(true);
    HapticFeedback.trigger('impactLight');

    try {
      const deviceId = await DeviceInfo.getUniqueId();
      const deviceInfo = {
        deviceId,
        model: await DeviceInfo.getModel(),
        systemVersion: await DeviceInfo.getSystemVersion(),
        appVersion: await DeviceInfo.getVersion(),
        bundleId: await DeviceInfo.getBundleId(),
      };

      // Check spam protection before login
      const spamCheck = await spamProtection.validateLoginAttempt(deviceId);
      if (!spamCheck.allowed) {
        setIsBlocked(true);
        setBlockTimeRemaining(spamCheck.blockTime);
        startCountdown(spamCheck.blockTime);
        Alert.alert('Too Many Attempts', 'Please wait before trying again');
        HapticFeedback.trigger('notificationError');
        return;
      }

      const success = await login({
        username: formData.username,
        password: formData.password,
        deviceInfo,
        captcha: captchaRequired ? captchaCode : null,
      });

      if (success) {
        // Reset spam protection on successful login
        await spamProtection.resetLoginAttempts(deviceId);
        
        // Save username if login successful
        await AsyncStorage.setItem('savedUsername', formData.username);
        
        HapticFeedback.trigger('notificationSuccess');
        
        // Navigate will be handled by App.js based on auth state
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

      Alert.alert('Login Failed', error.message || 'Invalid credentials');
      HapticFeedback.trigger('notificationError');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const savedCredentials = await AsyncStorage.getItem('biometricCredentials');
      if (!savedCredentials) {
        Alert.alert('Error', 'No biometric credentials found. Please login with password first.');
        return;
      }

      const success = await biometricAuth.authenticate('Login with biometrics');
      if (success) {
        const credentials = JSON.parse(savedCredentials);
        setFormData(credentials);
        await handleLogin();
      }
    } catch (error) {
      Alert.alert('Biometric Authentication Failed', error.message);
      HapticFeedback.trigger('notificationError');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      HapticFeedback.trigger('impactLight');
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      const success = await login({
        googleId: userInfo.user.id,
        email: userInfo.user.email,
        name: userInfo.user.name,
        photo: userInfo.user.photo,
        loginType: 'google',
      });

      if (success) {
        HapticFeedback.trigger('notificationSuccess');
      }
    } catch (error) {
      Alert.alert('Google Sign In Failed', error.message);
      HapticFeedback.trigger('notificationError');
    }
  };

  const handleForgotPassword = () => {
    HapticFeedback.trigger('impactLight');
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
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{translateY: slideAnim}]
              }
            ]}
          >
            {/* Logo */}
            <Animatable.View 
              animation="bounceIn" 
              delay={500}
              style={styles.logoContainer}
            >
              <LinearGradient
                colors={['#E1306C', '#F77737', '#FCAF45']}
                style={styles.logoGradient}
              >
                <Icon name="photo-camera" size={50} color="#fff" />
              </LinearGradient>
              <Text style={styles.logoText}>Instagram Clone</Text>
              <Text style={styles.tagline}>Connect, Share, Earn</Text>
            </Animatable.View>

            {/* Login Form */}
            <Animatable.View 
              animation="slideInUp" 
              delay={800}
              style={styles.formContainer}
            >
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
                  returnKeyType="next"
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
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
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
                <Animatable.View 
                  animation="slideInDown"
                  style={styles.captchaContainer}
                >
                  <Text style={styles.captchaLabel}>Security Check:</Text>
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
                </Animatable.View>
              )}

              {/* Block Warning */}
              {isBlocked && (
                <Animatable.View 
                  animation="shake"
                  style={styles.warningContainer}
                >
                  <Icon name="warning" size={20} color="#ff4444" />
                  <Text style={styles.warningText}>
                    Account blocked for {Math.ceil(blockTimeRemaining / 60)} minutes
                  </Text>
                </Animatable.View>
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
                activeOpacity={0.8}
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

              {/* Biometric Login */}
              {biometricAvailable && !isBlocked && (
                <TouchableOpacity
                  style={styles.biometricButton}
                  onPress={handleBiometricLogin}
                  activeOpacity={0.8}
                >
                  <Icon name="fingerprint" size={24} color="#E1306C" />
                  <Text style={styles.biometricText}>Login with Biometrics</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={handleForgotPassword}
                activeOpacity={0.7}
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
                activeOpacity={0.8}
              >
                <Icon name="google" size={20} color="#db4437" />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Register')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          </Animated.View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 5,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  eyeIcon: {
    padding: 5,
  },
  captchaContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  captchaLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  captchaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  captchaText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 5,
    color: '#333',
    fontFamily: 'monospace',
  },
  captchaInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  warningText: {
    color: '#ff4444',
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  attemptsWarning: {
    color: '#ff6600',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 5,
    shadowColor: '#E1306C',
    shadowOffset: {width: 0, height: 5},
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
    letterSpacing: 1,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(225, 48, 108, 0.1)',
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E1306C',
  },
  biometricText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#E1306C',
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  forgotPasswordText: {
    color: '#E1306C',
    fontSize: 14,
    fontWeight: '500',
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
    fontWeight: '500',
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  googleButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
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