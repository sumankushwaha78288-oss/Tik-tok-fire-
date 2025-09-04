import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 20px;
`;

const LoadingText = styled.div`
  font-size: 18px;
  font-weight: 500;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const Logo = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

const LoadingScreen = ({ message = 'Loading Instagram Clone...' }) => {
  return (
    <LoadingContainer>
      <Logo>📷</Logo>
      <Spinner />
      <LoadingText>{message}</LoadingText>
    </LoadingContainer>
  );
};

export default LoadingScreen;