import React from 'react';
import styled from 'styled-components';

const StakingContainer = styled.div`
  padding: 80px 20px 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const StakingCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
`;

const StakingPage = () => {
  return (
    <StakingContainer>
      <StakingCard>
        <h1>💰 Stake Funds</h1>
        <p>Fund staking with returns coming soon...</p>
      </StakingCard>
    </StakingContainer>
  );
};

export default StakingPage;