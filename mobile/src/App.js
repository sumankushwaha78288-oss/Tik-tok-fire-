import React, {useEffect, useState} from 'react';
import {
  StatusBar,
  StyleSheet,
  LogBox,
  Alert,
  Linking,
  AppState,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import PushNotification from 'react-native-push-notification';
import BackgroundTimer from 'react-native-background-timer';
import NetInfo from '@react-native-community/netinfo';

// Screens
import SplashScreenComponent from './screens/SplashScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import ForgotPasswordScreen from './screens/auth/ForgotPasswordScreen';
import MainTabNavigator from './navigation/MainTabNavigator';

// Services
import {authService} from './services/authService';
import {notificationService} from './services/notificationService';
import {socketService} from './services/socketService';

// Utils
import {spamProtection} from './utils/spamProtection';
import {securityUtils} from './utils/securityUtils';

// Context
import {AuthProvider, useAuth} from './context/AuthContext';
import {ThemeProvider} from './context/ThemeContext';
import {SocketProvider} from './context/SocketContext';

const Stack = createStackNavigator();

// Ignore specific warnings
LogBox.ignoreLogs([
  'VirtualizedLists should never be nested',
  'Setting a timer for a long period of time',
  'Remote debugger is in a background tab',
]);

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId: 'your-web-client-id.googleusercontent.com',
  offlineAccess: true,
  hostedDomain: '',
  forceCodeForRefreshToken: true,
});

// Configure Push Notifications
PushNotification.configure({
  onRegister: function (token) {
    console.log('TOKEN:', token);
    // Send token to your server
  },
  onNotification: function (notification) {
    console.log('NOTIFICATION:', notification);
    if (notification.userInteraction) {
      // Handle notification tap
    }
  },
  permissions: {
    alert: true,
    badge: true,
    sound: true,
  },
  popInitialNotification: true,
  requestPermissions: true,
});

const AppNavigator = () => {
  const {user, isAuthenticated, loading, checkAuthStatus} = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    initializeApp();
    setupAppStateListener();
    setupNetworkListener();
    
    return () => {
      cleanupApp();
    };
  }, []);

  const initializeApp = async () => {
    try {
      // Check if first time launch
      const hasLaunchedBefore = await AsyncStorage.getItem('hasLaunchedBefore');
      if (!hasLaunchedBefore) {
        setShowOnboarding(true);
        await AsyncStorage.setItem('hasLaunchedBefore', 'true');
      }

      // Initialize security
      await securityUtils.initializeSecurity();
      
      // Check authentication status
      await checkAuthStatus();
      
      // Initialize services
      await notificationService.initialize();
      
      // Hide splash screen
      setTimeout(() => {
        SplashScreen.hide();
      }, 2000);
      
    } catch (error) {
      console.error('App initialization error:', error);
      SplashScreen.hide();
    }
  };

  const setupAppStateListener = () => {
    const handleAppStateChange = (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        handleAppForeground();
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        handleAppBackground();
      }
      setAppState(nextAppState);
    };

    AppState.addEventListener('change', handleAppStateChange);
    return () => AppState.removeEventListener('change', handleAppStateChange);
  };

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        Alert.alert(
          'No Internet Connection',
          'Please check your internet connection and try again.',
        );
      }
    });
    return unsubscribe;
  };

  const handleAppForeground = async () => {
    // Refresh auth status
    await checkAuthStatus();
    
    // Reconnect socket if authenticated
    if (isAuthenticated) {
      socketService.connect();
    }
    
    // Clear badge count
    PushNotification.setApplicationIconBadgeNumber(0);
  };

  const handleAppBackground = () => {
    // Disconnect socket to save battery
    socketService.disconnect();
    
    // Start background tasks if needed
    if (isAuthenticated) {
      BackgroundTimer.start();
    }
  };

  const cleanupApp = () => {
    socketService.disconnect();
    BackgroundTimer.stop();
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  if (loading) {
    return <SplashScreenComponent />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <NavigationContainer>
      <StatusBar
        barStyle="light-content"
        backgroundColor="#667eea"
        translucent
      />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: ({current, layouts}) => ({
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          }),
        }}>
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          // Main App Stack
          <Stack.Screen name="MainApp" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <AppNavigator />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;