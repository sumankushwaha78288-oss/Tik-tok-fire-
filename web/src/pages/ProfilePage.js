import React from 'react';
import styled from 'styled-components';

const ProfileContainer = styled.div`
  padding: 80px 20px 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const ProfileCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
`;

const ProfilePage = () => {
  return (
    <ProfileContainer>
      <ProfileCard>
        <h1>Profile Page</h1>
        <p>Coming soon...</p>
      </ProfileCard>
    </ProfileContainer>
  );
};

export default ProfilePage;