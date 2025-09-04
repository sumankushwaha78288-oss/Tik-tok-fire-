import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { spamProtection } from '../utils/spamProtection';
import { validation } from '../utils/validation';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const LoginCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 30px;
`;

const LogoIcon = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 15px;
  background: linear-gradient(45deg, #E1306C, #F77737, #FCAF45);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: white;
`;

const Title = styled.h1`
  color: #333;
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
  margin: 10px 0 0 0;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 15px 50px 15px 50px;
  border: 2px solid ${props => props.error ? '#ff4444' : '#e1e5e9'};
  border-radius: 12px;
  font-size: 16px;
  background: #f8f9fa;
  transition: all 0.3s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #E1306C;
    background: white;
    box-shadow: 0 0 0 3px rgba(225, 48, 108, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 20px;
`;

const TogglePassword = styled.button`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 20px;
`;

const ErrorText = styled.div`
  color: #ff4444;
  font-size: 14px;
  margin-top: 5px;
`;

const CaptchaContainer = styled.div`
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 15px;
  background: #f8f9fa;
`;

const CaptchaBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #e9ecef;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const CaptchaText = styled.div`
  font-size: 20px;
  font-weight: bold;
  letter-spacing: 3px;
  color: #333;
  font-family: monospace;
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #666;
`;

const WarningBox = styled.div`
  background: #ffe6e6;
  border: 1px solid #ffcccc;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #d32f2f;
  font-size: 14px;
`;

const AttemptsWarning = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 10px;
  color: #856404;
  font-size: 14px;
  text-align: center;
`;

const LoginButton = styled(motion.button)`
  background: linear-gradient(45deg, #E1306C, #F77737);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 15px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(225, 48, 108, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 20px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e1e5e9;
  }
  
  span {
    padding: 0 15px;
    color: #666;
    font-size: 14px;
  }
`;

const SocialButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  background: white;
  color: #333;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    border-color: #E1306C;
    background: #f8f9fa;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: 20px;
  
  a {
    color: #E1306C;
    text-decoration: none;
    font-weight: 600;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const ForgotPassword = styled.div`
  text-align: center;
  margin: 15px 0;
  
  a {
    color: #E1306C;
    text-decoration: none;
    font-size: 14px;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [captchaCode, setCaptchaCode] = useState('');
  const [generatedCaptcha, setGeneratedCaptcha] = useState('');

  useEffect(() => {
    checkSpamProtection();
    generateCaptcha();
  }, []);

  const checkSpamProtection = async () => {
    const fingerprint = await spamProtection.getDeviceFingerprint();
    const spamStatus = await spamProtection.checkLoginAttempts(fingerprint);
    
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username or email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (captchaRequired && captchaCode !== generatedCaptcha) {
      newErrors.captcha = 'Invalid captcha code';
      generateCaptcha();
      setCaptchaCode('');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isBlocked) {
      toast.error(`Account blocked. Try again in ${Math.ceil(blockTimeRemaining / 60)} minutes.`);
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      const deviceFingerprint = await spamProtection.getDeviceFingerprint();
      
      // Check spam protection
      const spamCheck = await spamProtection.validateLoginAttempt(deviceFingerprint);
      if (!spamCheck.allowed) {
        setIsBlocked(true);
        setBlockTimeRemaining(spamCheck.blockTime);
        startCountdown(spamCheck.blockTime);
        toast.error('Too many attempts. Please wait before trying again.');
        return;
      }

      const result = await onLogin({
        ...formData,
        deviceFingerprint,
        captcha: captchaRequired ? captchaCode : null,
      });

      if (result.success) {
        // Reset spam protection on successful login
        await spamProtection.resetLoginAttempts(deviceFingerprint);
      }
    } catch (error) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setCaptchaRequired(true);
        generateCaptcha();
      }

      if (newAttempts >= 5) {
        const fingerprint = await spamProtection.getDeviceFingerprint();
        await spamProtection.blockDevice(fingerprint, 900); // 15 minutes
        setIsBlocked(true);
        setBlockTimeRemaining(900);
        startCountdown(900);
      }

      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // Google login implementation
    toast.info('Google login coming soon!');
  };

  return (
    <LoginContainer>
      <LoginCard
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Logo>
          <LogoIcon>📷</LogoIcon>
          <Title>Instagram Clone</Title>
          <Subtitle>Connect, Share, Earn</Subtitle>
        </Logo>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <InputIcon>👤</InputIcon>
            <Input
              type="text"
              placeholder="Username or Email"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              error={errors.username}
              disabled={isBlocked}
            />
            {errors.username && <ErrorText>{errors.username}</ErrorText>}
          </InputGroup>

          <InputGroup>
            <InputIcon>🔒</InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              error={errors.password}
              disabled={isBlocked}
            />
            <TogglePassword
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? '🙈' : '👁️'}
            </TogglePassword>
            {errors.password && <ErrorText>{errors.password}</ErrorText>}
          </InputGroup>

          {captchaRequired && (
            <CaptchaContainer>
              <div style={{ marginBottom: '10px', fontWeight: '600', color: '#333' }}>
                Security Check:
              </div>
              <CaptchaBox>
                <CaptchaText>{generatedCaptcha}</CaptchaText>
                <RefreshButton type="button" onClick={generateCaptcha}>
                  🔄
                </RefreshButton>
              </CaptchaBox>
              <Input
                type="text"
                placeholder="Enter captcha code"
                value={captchaCode}
                onChange={(e) => setCaptchaCode(e.target.value)}
                maxLength={5}
              />
              {errors.captcha && <ErrorText>{errors.captcha}</ErrorText>}
            </CaptchaContainer>
          )}

          {isBlocked && (
            <WarningBox>
              <span>⚠️</span>
              <span>Account blocked for {Math.ceil(blockTimeRemaining / 60)} minutes due to too many failed attempts.</span>
            </WarningBox>
          )}

          {loginAttempts > 0 && !isBlocked && (
            <AttemptsWarning>
              ⚠️ {5 - loginAttempts} attempts remaining before temporary block
            </AttemptsWarning>
          )}

          <LoginButton
            type="submit"
            disabled={loading || isBlocked}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </LoginButton>

          <ForgotPassword>
            <Link to="/forgot-password">Forgot Password?</Link>
          </ForgotPassword>

          <Divider>
            <span>OR</span>
          </Divider>

          <SocialButton
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading || isBlocked}
          >
            <span style={{ color: '#db4437' }}>🌐</span>
            Continue with Google
          </SocialButton>
        </Form>

        <LinkContainer>
          Don't have an account? <Link to="/register">Sign Up</Link>
        </LinkContainer>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;