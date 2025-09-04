import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const RegisterCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 40px;
  width: 100%;
  max-width: 450px;
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
  gap: 15px;
`;

const Input = styled.input`
  padding: 15px;
  border: 2px solid ${props => props.error ? '#ff4444' : '#e1e5e9'};
  border-radius: 12px;
  font-size: 16px;
  background: #f8f9fa;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #E1306C;
    background: white;
    box-shadow: 0 0 0 3px rgba(225, 48, 108, 0.1);
  }
`;

const ErrorText = styled.div`
  color: #ff4444;
  font-size: 14px;
  margin-top: -10px;
  margin-bottom: 5px;
`;

const RegisterButton = styled(motion.button)`
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

const RegisterPage = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await onRegister(formData);
      if (result.success) {
        toast.success('Account created successfully!');
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  return (
    <RegisterContainer>
      <RegisterCard
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Logo>
          <LogoIcon>📷</LogoIcon>
          <Title>Create Account</Title>
          <Subtitle>Join Instagram Clone today</Subtitle>
        </Logo>

        <Form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            error={errors.fullName}
          />
          {errors.fullName && <ErrorText>{errors.fullName}</ErrorText>}

          <Input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
          />
          {errors.username && <ErrorText>{errors.username}</ErrorText>}

          <Input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          {errors.email && <ErrorText>{errors.email}</ErrorText>}

          <Input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
          />
          {errors.phone && <ErrorText>{errors.phone}</ErrorText>}

          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />
          {errors.password && <ErrorText>{errors.password}</ErrorText>}

          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />
          {errors.confirmPassword && <ErrorText>{errors.confirmPassword}</ErrorText>}

          <RegisterButton
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </RegisterButton>
        </Form>

        <LinkContainer>
          Already have an account? <Link to="/login">Sign In</Link>
        </LinkContainer>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default RegisterPage;