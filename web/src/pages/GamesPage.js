import React from 'react';
import styled from 'styled-components';

const GamesContainer = styled.div`
  padding: 80px 20px 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const GamesCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
`;

const GamesPage = () => {
  return (
    <GamesContainer>
      <GamesCard>
        <h1>🎮 Money Games</h1>
        <p>Gaming with 20% commission system coming soon...</p>
      </GamesCard>
    </GamesContainer>
  );
};

export default GamesPage;