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
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { authService } from '../../services/authService';
import { spamProtection } from '../../utils/spamProtection';
import { validation } from '../../utils/validation';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [registrationAttempts, setRegistrationAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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

    checkSpamProtection();
    generateCaptcha();
  }, []);

  const checkSpamProtection = async () => {
    const deviceId = await DeviceInfo.getUniqueId();
    const spamStatus = await spamProtection.checkRegistrationAttempts(deviceId);
    
    if (spamStatus.isBlocked) {
      setIsBlocked(true);
      setBlockTimeRemaining(spamStatus.remainingTime);
      startCountdown(spamStatus.remainingTime);
    }

    if (spamStatus.attempts >= 2) {
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
        setRegistrationAttempts(0);
        setCaptchaRequired(false);
      }
    }, 1000);
  };

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCaptcha(result);
  };

  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!validation.isValidUsername(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters, alphanumeric and underscores only';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validation.isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validation.isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validation.isStrongPassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number and special character';
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Captcha validation
    if (captchaRequired && captchaCode !== generatedCaptcha) {
      newErrors.captcha = 'Invalid captcha code';
      generateCaptcha();
      setCaptchaCode('');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (isBlocked) {
      Alert.alert('Registration Blocked', 
        `Too many attempts. Try again in ${Math.ceil(blockTimeRemaining / 60)} minutes.`);
      return;
    }

    if (!validateForm()) return;

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

      // Check spam protection
      const spamCheck = await spamProtection.validateRegistrationAttempt(deviceId);
      if (!spamCheck.allowed) {
        setIsBlocked(true);
        setBlockTimeRemaining(spamCheck.blockTime);
        startCountdown(spamCheck.blockTime);
        Alert.alert('Too Many Attempts', 'Please wait before trying again');
        return;
      }

      // Send email verification first
      const verificationResponse = await authService.sendEmailVerification(formData.email);
      if (verificationResponse.success) {
        setEmailVerificationSent(true);
        setShowVerification(true);
        Alert.alert('Verification Sent', 'Please check your email for verification code');
      }

    } catch (error) {
      const newAttempts = registrationAttempts + 1;
      setRegistrationAttempts(newAttempts);
      
      if (newAttempts >= 2) {
        setCaptchaRequired(true);
        generateCaptcha();
      }

      if (newAttempts >= 3) {
        const deviceId = await DeviceInfo.getUniqueId();
        await spamProtection.blockDevice(deviceId, 1800); // 30 minutes
        setIsBlocked(true);
        setBlockTimeRemaining(1800);
        startCountdown(1800);
      }

      Alert.alert('Registration Failed', 
        error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndRegister = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter verification code');
      return;
    }

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

      const response = await authService.register({
        ...formData,
        verificationCode,
        deviceInfo,
        captcha: captchaRequired ? captchaCode : null
      });

      if (response.success) {
        await AsyncStorage.setItem('authToken', response.token);
        await AsyncStorage.setItem('userId', response.user.id);
        await AsyncStorage.setItem('userInfo', JSON.stringify(response.user));
        
        // Reset spam protection on successful registration
        await spamProtection.resetRegistrationAttempts(deviceId);
        
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          })}
        ]);
      }
    } catch (error) {
      Alert.alert('Verification Failed', 
        error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      const response = await authService.googleRegister({
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
      Alert.alert('Google Sign Up Failed', error.message);
    }
  };

  const resendVerification = async () => {
    try {
      await authService.sendEmailVerification(formData.email);
      Alert.alert('Verification Sent', 'New verification code sent to your email');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend verification code');
    }
  };

  if (showVerification) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <LinearGradient colors={['#667eea', '#764ba2']} style={styles.gradient}>
          <View style={styles.verificationContainer}>
            <Icon name="email" size={80} color="#fff" />
            <Text style={styles.verificationTitle}>Verify Your Email</Text>
            <Text style={styles.verificationSubtitle}>
              We've sent a verification code to {formData.email}
            </Text>
            
            <TextInput
              style={styles.verificationInput}
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChangeText={setVerificationCode}
              keyboardType="numeric"
              maxLength={6}
              textAlign="center"
            />

            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerifyAndRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.verifyButtonText}>Verify & Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.resendButton} onPress={resendVerification}>
              <Text style={styles.resendText}>Resend Code</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowVerification(false)}>
              <Text style={styles.backText}>← Back to Registration</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
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
                <Icon name="photo-camera" size={40} color="#fff" />
              </LinearGradient>
              <Text style={styles.logoText}>Create Account</Text>
            </View>

            {/* Registration Form */}
            <View style={styles.formContainer}>
              {/* Full Name */}
              <View style={styles.inputContainer}>
                <Icon name="person" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  value={formData.fullName}
                  onChangeText={(text) => setFormData({...formData, fullName: text})}
                  editable={!isBlocked}
                />
              </View>
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

              {/* Username */}
              <View style={styles.inputContainer}>
                <Icon name="alternate-email" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#999"
                  value={formData.username}
                  onChangeText={(text) => setFormData({...formData, username: text.toLowerCase()})}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isBlocked}
                />
              </View>
              {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

              {/* Email */}
              <View style={styles.inputContainer}>
                <Icon name="email" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#999"
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text.toLowerCase()})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isBlocked}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

              {/* Phone */}
              <View style={styles.inputContainer}>
                <Icon name="phone" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor="#999"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({...formData, phone: text})}
                  keyboardType="phone-pad"
                  maxLength={10}
                  editable={!isBlocked}
                />
              </View>
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

              {/* Password */}
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
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <Icon name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm Password"
                  placeholderTextColor="#999"
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
                  secureTextEntry={!showConfirmPassword}
                  editable={!isBlocked}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Icon 
                    name={showConfirmPassword ? 'visibility-off' : 'visibility'} 
                    size={20} 
                    color="#666" 
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

              {/* Password Strength Indicator */}
              <View style={styles.passwordStrength}>
                <Text style={styles.strengthLabel}>Password Strength:</Text>
                <View style={styles.strengthBar}>
                  <View 
                    style={[
                      styles.strengthFill,
                      { width: `${validation.getPasswordStrength(formData.password)}%` },
                      { backgroundColor: validation.getPasswordStrength(formData.password) > 70 ? '#4CAF50' : 
                        validation.getPasswordStrength(formData.password) > 40 ? '#FF9800' : '#f44336' }
                    ]} 
                  />
                </View>
              </View>

              {/* Captcha */}
              {captchaRequired && (
                <View style={styles.captchaContainer}>
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
                    maxLength={6}
                  />
                  {errors.captcha && <Text style={styles.errorText}>{errors.captcha}</Text>}
                </View>
              )}

              {/* Block Warning */}
              {isBlocked && (
                <View style={styles.warningContainer}>
                  <Icon name="warning" size={20} color="#ff4444" />
                  <Text style={styles.warningText}>
                    Registration blocked for {Math.ceil(blockTimeRemaining / 60)} minutes
                  </Text>
                </View>
              )}

              {/* Registration Attempts Warning */}
              {registrationAttempts > 0 && !isBlocked && (
                <Text style={styles.attemptsWarning}>
                  {3 - registrationAttempts} attempts remaining
                </Text>
              )}

              <TouchableOpacity
                style={[styles.registerButton, (loading || isBlocked) && styles.disabledButton]}
                onPress={handleRegister}
                disabled={loading || isBlocked}
              >
                <LinearGradient
                  colors={['#E1306C', '#F77737']}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.registerButtonText}>Sign Up</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Terms and Privacy */}
              <Text style={styles.termsText}>
                By signing up, you agree to our{' '}
                <Text style={styles.linkText}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>

              {/* Social Registration */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignUp}
                disabled={loading || isBlocked}
              >
                <Icon name="google" size={20} color="#db4437" />
                <Text style={styles.googleButtonText}>Sign up with Google</Text>
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
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
    paddingVertical: 30,
  },
  content: {
    paddingHorizontal: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 25,
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
    marginBottom: 5,
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
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  passwordStrength: {
    marginBottom: 15,
  },
  strengthLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  strengthBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  captchaContainer: {
    marginBottom: 15,
  },
  captchaLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
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
    letterSpacing: 3,
    color: '#333',
  },
  captchaInput: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    textAlign: 'center',
    letterSpacing: 2,
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
  registerButton: {
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
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  linkText: {
    color: '#E1306C',
    fontWeight: 'bold',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#E1306C',
    fontSize: 14,
    fontWeight: 'bold',
  },
  verificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  verificationSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.9,
  },
  verificationInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 5,
    marginBottom: 20,
    width: '80%',
  },
  verifyButton: {
    backgroundColor: '#E1306C',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resendButton: {
    marginBottom: 20,
  },
  resendText: {
    color: '#fff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  backText: {
    color: '#fff',
    fontSize: 14,
  },
});

export default RegisterScreen;