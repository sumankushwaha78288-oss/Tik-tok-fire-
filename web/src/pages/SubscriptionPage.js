import React from 'react';
import styled from 'styled-components';

const SubscriptionContainer = styled.div`
  padding: 80px 20px 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const SubscriptionCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
`;

const SubscriptionPage = () => {
  return (
    <SubscriptionContainer>
      <SubscriptionCard>
        <h1>👑 Subscriptions</h1>
        <p>Premium subscription plans coming soon...</p>
      </SubscriptionCard>
    </SubscriptionContainer>
  );
};

export default SubscriptionPage;