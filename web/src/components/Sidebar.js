import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const SidebarContainer = styled.aside`
  position: fixed;
  left: 0;
  top: 60px;
  bottom: 0;
  width: ${props => props.isOpen ? '250px' : '60px'};
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  transition: width 0.3s ease;
  z-index: 999;
  overflow: hidden;
`;

const MenuItem = styled(Link)`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: ${props => props.active ? '#E1306C' : '#666'};
  background: ${props => props.active ? 'rgba(225, 48, 108, 0.1)' : 'transparent'};
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: ${props => props.active ? '3px solid #E1306C' : '3px solid transparent'};
  
  &:hover {
    background: rgba(225, 48, 108, 0.1);
    color: #E1306C;
  }
`;

const MenuIcon = styled.span`
  font-size: 20px;
  margin-right: 15px;
  min-width: 20px;
`;

const MenuText = styled.span`
  font-weight: 500;
  white-space: nowrap;
`;

const Sidebar = ({ isOpen, user }) => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/', icon: '🏠', text: 'Home' },
    { path: '/profile', icon: '👤', text: 'Profile' },
    { path: '/chat', icon: '💬', text: 'Chat' },
    { path: '/games', icon: '🎮', text: 'Games' },
    { path: '/staking', icon: '💰', text: 'Staking' },
    { path: '/payment', icon: '💳', text: 'Payment' },
    { path: '/subscription', icon: '👑', text: 'Subscription' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ path: '/admin', icon: '⚙️', text: 'Admin Panel' });
  }

  return (
    <SidebarContainer isOpen={isOpen}>
      {menuItems.map((item) => (
        <MenuItem
          key={item.path}
          to={item.path}
          active={location.pathname === item.path}
        >
          <MenuIcon>{item.icon}</MenuIcon>
          {isOpen && <MenuText>{item.text}</MenuText>}
        </MenuItem>
      ))}
    </SidebarContainer>
  );
};

export default Sidebar;