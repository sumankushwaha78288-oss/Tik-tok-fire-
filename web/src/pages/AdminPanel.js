import React from 'react';
import styled from 'styled-components';

const AdminContainer = styled.div`
  padding: 80px 20px 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const AdminCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 40px;
  text-align: center;
`;

const AdminPanel = () => {
  return (
    <AdminContainer>
      <AdminCard>
        <h1>⚙️ Admin Panel</h1>
        <p>Admin dashboard coming soon...</p>
      </AdminCard>
    </AdminContainer>
  );
};

export default AdminPanel;