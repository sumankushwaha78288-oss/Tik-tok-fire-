const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mock database for demonstration
const users = [];
let userIdCounter = 1;

// Mock authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Mock user lookup
    const user = users.find(u => 
      u.username === username || u.email === username
    );
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Mock password check (in real app, use bcrypt)
    if (password !== user.password) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Mock JWT token
    const token = `mock_token_${user.id}_${Date.now()}`;
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role || 'user'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, username, email, phone, password } = req.body;
    
    // Check if user already exists
    const existingUser = users.find(u => 
      u.username === username || u.email === email
    );
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Create new user
    const newUser = {
      id: userIdCounter++,
      fullName,
      username,
      email,
      phone,
      password, // In real app, hash this
      createdAt: new Date(),
      role: 'user'
    };
    
    users.push(newUser);
    
    // Mock JWT token
    const token = `mock_token_${newUser.id}_${Date.now()}`;
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

app.post('/api/auth/send-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Mock email verification
    console.log(`Sending verification email to: ${email}`);
    
    res.json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email'
    });
  }
});

app.get('/api/auth/verify-token', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  // Mock token validation
  if (token && token.startsWith('mock_token_')) {
    res.json({ valid: true });
  } else {
    res.status(401).json({ valid: false });
  }
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !token.startsWith('mock_token_')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Extract user ID from mock token
  const userId = parseInt(token.split('_')[2]);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend should be running on http://localhost:3000`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
});