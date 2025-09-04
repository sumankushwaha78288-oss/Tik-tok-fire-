import React from 'react';
import styled from 'styled-components';

const NavbarContainer = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  z-index: 1000;
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(45deg, #E1306C, #F77737);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const UserName = styled.span`
  font-weight: 500;
  color: #333;
`;

const LogoutButton = styled.button`
  background: #E1306C;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #c12d5f;
  }
`;

const Navbar = ({ user, onLogout, sidebarOpen, setSidebarOpen }) => {
  return (
    <NavbarContainer>
      <Logo>📷 Instagram Clone</Logo>
      <UserInfo>
        <UserName>Welcome, {user?.fullName || 'User'}</UserName>
        <LogoutButton onClick={onLogout}>Logout</LogoutButton>
      </UserInfo>
    </NavbarContainer>
  );
};

export default Navbar;