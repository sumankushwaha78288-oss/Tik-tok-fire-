import React from 'react';
import styled from 'styled-components';

const PaymentContainer = styled.div`
  padding: 80px 20px 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const PaymentCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
`;

const PaymentPage = () => {
  return (
    <PaymentContainer>
      <PaymentCard>
        <h1>💳 Payment Gateway</h1>
        <p>UPI and payment integration coming soon...</p>
      </PaymentCard>
    </PaymentContainer>
  );
};

export default PaymentPage;