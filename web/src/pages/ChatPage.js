import React from 'react';
import styled from 'styled-components';

const ChatContainer = styled.div`
  padding: 80px 20px 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const ChatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
`;

const ChatPage = () => {
  return (
    <ChatContainer>
      <ChatCard>
        <h1>💬 Live Chat</h1>
        <p>Real-time messaging coming soon...</p>
      </ChatCard>
    </ChatContainer>
  );
};

export default ChatPage;