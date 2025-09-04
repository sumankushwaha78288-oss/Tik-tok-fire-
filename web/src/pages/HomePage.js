import React from 'react';
import styled from 'styled-components';

const HomeContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const WelcomeCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
  background: linear-gradient(45deg, #E1306C, #F77737);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 18px;
  line-height: 1.6;
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 30px;
  text-align: center;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 48px;
  margin-bottom: 15px;
`;

const FeatureTitle = styled.h3`
  color: #333;
  margin-bottom: 10px;
`;

const FeatureDescription = styled.p`
  color: #666;
  font-size: 14px;
`;

const HomePage = () => {
  const features = [
    {
      icon: '📱',
      title: 'Social Media',
      description: 'Share photos, videos, and stories with your friends'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      description: 'Real-time messaging with friends and groups'
    },
    {
      icon: '🎮',
      title: 'Money Games',
      description: 'Play games and earn money with 20% commission system'
    },
    {
      icon: '💰',
      title: 'Stake Funds',
      description: 'Invest your money and earn returns through staking'
    },
    {
      icon: '💳',
      title: 'Payment Gateway',
      description: 'Secure payments with multiple options including UPI'
    },
    {
      icon: '👑',
      title: 'Subscriptions',
      description: 'Premium features and exclusive content'
    }
  ];

  return (
    <HomeContainer>
      <WelcomeCard>
        <Title>Welcome to Instagram Clone</Title>
        <Subtitle>
          Experience the ultimate social media platform with gaming, staking, 
          and earning opportunities. Connect with friends, share moments, and 
          grow your wealth all in one place.
        </Subtitle>
      </WelcomeCard>

      <FeatureGrid>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <FeatureIcon>{feature.icon}</FeatureIcon>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureDescription>{feature.description}</FeatureDescription>
          </FeatureCard>
        ))}
      </FeatureGrid>
    </HomeContainer>
  );
};

export default HomePage;