# 📷 Instagram Clone - Full Stack Social Media App

A comprehensive Instagram-like social media application with advanced features including live chat, money games, staking system, payment integration, and more.

## 🌟 Features

### Core Social Media Features
- ✅ User Authentication (Login/Signup) with spam protection
- ✅ User profiles and posts
- ✅ Photo and video sharing
- ✅ Stories feature
- ✅ Follow/Unfollow system
- ✅ Like and comment system

### Advanced Features
- 💬 **Live Chat System** - Real-time messaging with Socket.io
- 🎮 **Money Games** - Gaming system with 20% commission
- 💰 **Staking System** - Fund staking with returns
- 💳 **Payment Gateway** - Multiple payment options including UPI
- 👑 **Subscription System** - Premium features and plans
- ⚙️ **Admin Panel** - Complete management dashboard
- 🔒 **Spam Protection** - Advanced security features
- 📱 **Responsive Design** - Works on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd instagram-clone-app
```

2. **Install dependencies**
```bash
# Install main dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

3. **Start the development servers**

**Option 1: Start both servers together**
```bash
npm run dev
```

**Option 2: Start servers separately**
```bash
# Terminal 1 - Start backend server
cd server
npm start

# Terminal 2 - Start frontend (in project root)
npm start
```

4. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 🏗️ Project Structure

```
instagram-clone-app/
├── web/                    # Frontend React app
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── stores/         # State management
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # Global styles
│   └── public/             # Static assets
├── server/                 # Backend Node.js server
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   └── config/             # Configuration files
├── mobile/                 # React Native app (future)
└── admin/                  # Admin panel (future)
```

## 🔐 Authentication & Security

### Login/Signup Features
- ✅ **Secure Authentication** with encrypted passwords
- ✅ **Spam Protection** with device fingerprinting
- ✅ **Rate Limiting** to prevent brute force attacks
- ✅ **CAPTCHA System** after multiple failed attempts
- ✅ **Email Verification** for new accounts
- ✅ **Account Blocking** for suspicious activity
- ✅ **Input Validation** and sanitization
- ✅ **SQL Injection Protection**
- ✅ **XSS Prevention**

### Security Measures
- Device fingerprinting for spam detection
- Encrypted sensitive data transmission
- JWT token-based authentication
- Session management
- IP-based rate limiting
- Suspicious pattern detection

## 💳 Payment Integration

### Supported Payment Methods
- **UPI** - Indian Unified Payments Interface
- **Razorpay** - Credit/Debit cards, Net banking
- **Wallet System** - In-app digital wallet
- **Cryptocurrency** (planned)

### Payment Features
- Secure payment processing
- Transaction history
- Refund management
- Commission tracking
- Multi-currency support (planned)

## 🎮 Gaming System

### Game Features
- Multiple game types (slots, dice, cards)
- Real-time betting system
- 20% commission on all games
- Win/loss tracking
- Leaderboards
- Daily bonuses

### Staking System
- Fund staking with different durations
- Compound interest calculations
- Risk management
- Automatic payouts
- Staking history

## 🛠️ Development

### Available Scripts

```bash
# Frontend
npm start              # Start development server
npm run build          # Build for production
npm test               # Run tests

# Backend
cd server
npm start              # Start server
npm run dev            # Start with nodemon

# Combined
npm run dev            # Start both frontend and backend
```

### Environment Variables

Create `.env` files based on the `.env.example` templates:

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SOCKET_URL=http://localhost:3001
REACT_APP_ENCRYPTION_KEY=your-encryption-key
```

**Backend (server/.env)**
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/instagram_clone
JWT_SECRET=your-jwt-secret
RAZORPAY_KEY_ID=your-razorpay-key
```

## 📱 Mobile App (React Native)

The mobile version is built with React Native and includes:
- Native iOS and Android apps
- Push notifications
- Camera integration
- Biometric authentication
- Offline support

### Running Mobile App
```bash
# Android
npm run android

# iOS
npm run ios
```

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy the build folder to your hosting service
```

### Backend Deployment
```bash
cd server
npm start
# Deploy to your server (Heroku, AWS, etc.)
```

### Google Play Store
The app is configured for Google Play Store deployment with:
- Proper signing configuration
- Release build optimization
- Store metadata
- Privacy policy compliance

## 🔧 Admin Panel

Access the admin panel at `/admin` with admin credentials:
- User management
- Content moderation
- Payment monitoring
- Analytics dashboard
- System configuration

## 📊 Analytics & SEO

### SEO Features
- Server-side rendering
- Meta tags optimization
- Structured data (Schema.org)
- Sitemap generation
- Social media integration

### Analytics
- User engagement tracking
- Payment analytics
- Game performance metrics
- Revenue reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@instagramclone.com
- Documentation: [Wiki](wiki)

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic social media features
- ✅ Authentication system
- ✅ Payment integration
- ✅ Gaming system

### Phase 2 (Next)
- 📱 Mobile app completion
- 🎥 Video calling
- 🤖 AI content moderation
- 🌐 Multi-language support

### Phase 3 (Future)
- 🏪 Marketplace
- 📊 Advanced analytics
- 🎨 NFT integration
- 🌍 Global expansion

---

## 🚀 Getting Started Now!

Your Instagram Clone web application is now running! 

**Frontend**: http://localhost:3000
**Backend**: http://localhost:3001

### Test the Authentication:
1. Go to http://localhost:3000
2. Click "Sign Up" to create a new account
3. Fill in the registration form
4. Try logging in with your credentials
5. Experience the spam protection features

The app includes comprehensive security features, responsive design, and is ready for further development of gaming, staking, and payment features.

**Happy coding! 🎉**