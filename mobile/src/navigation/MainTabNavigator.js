import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {View, Text, StyleSheet, Platform} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import SearchScreen from '../screens/search/SearchScreen';
import CameraScreen from '../screens/camera/CameraScreen';
import ActivityScreen from '../screens/activity/ActivityScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ChatListScreen from '../screens/chat/ChatListScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import PostDetailScreen from '../screens/post/PostDetailScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import GamesScreen from '../screens/games/GamesScreen';
import StakingScreen from '../screens/staking/StakingScreen';
import PaymentScreen from '../screens/payment/PaymentScreen';
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Custom Tab Bar Icon Component
const TabBarIcon = ({focused, name, size = 24}) => {
  return (
    <Animatable.View
      animation={focused ? 'bounceIn' : undefined}
      duration={500}
      style={[styles.tabIconContainer, focused && styles.focusedTabIcon]}
    >
      {focused && (
        <LinearGradient
          colors={['#E1306C', '#F77737']}
          style={styles.tabIconGradient}
        />
      )}
      <Icon
        name={name}
        size={size}
        color={focused ? '#fff' : '#8E8E93'}
        style={styles.tabIcon}
      />
    </Animatable.View>
  );
};

// Home Stack
const HomeStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

// Search Stack
const SearchStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="SearchMain" component={SearchScreen} />
    <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

// Activity Stack
const ActivityStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="ActivityMain" component={ActivityScreen} />
    <Stack.Screen name="ChatList" component={ChatListScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} />
    <Stack.Screen name="Games" component={GamesScreen} />
    <Stack.Screen name="Staking" component={StakingScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="Subscription" component={SubscriptionScreen} />
    <Stack.Screen name="Wallet" component={WalletScreen} />
  </Stack.Navigator>
);

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({focused}) => (
            <TabBarIcon focused={focused} name="home" />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStack}
        options={{
          tabBarIcon: ({focused}) => (
            <TabBarIcon focused={focused} name="search" />
          ),
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <View style={styles.cameraIconContainer}>
              <LinearGradient
                colors={['#E1306C', '#F77737']}
                style={styles.cameraGradient}
              >
                <Icon name="add-box" size={28} color="#fff" />
              </LinearGradient>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityStack}
        options={{
          tabBarIcon: ({focused}) => (
            <TabBarIcon focused={focused} name="favorite" />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({focused}) => (
            <TabBarIcon focused={focused} name="person" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Custom Tab Bar Component
const CustomTabBar = ({state, descriptors, navigation}) => {
  return (
    <View style={styles.customTabBar}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.9)']}
        style={styles.tabBarGradient}
      >
        <View style={styles.tabBarContent}>
          {state.routes.map((route, index) => {
            const {options} = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Animatable.View
                key={route.key}
                animation={isFocused ? 'pulse' : undefined}
                duration={300}
                style={styles.tabItem}
              >
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityState={isFocused ? {selected: true} : {}}
                  onPress={onPress}
                  style={styles.tabButton}
                  activeOpacity={0.7}
                >
                  {options.tabBarIcon({focused: isFocused})}
                </TouchableOpacity>
              </Animatable.View>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 90 : 70,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
  },
  customTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 90 : 70,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabBarGradient: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabBarContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  focusedTabIcon: {
    transform: [{scale: 1.1}],
  },
  tabIconGradient: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  tabIcon: {
    zIndex: 1,
  },
  cameraIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#E1306C',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cameraGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MainTabNavigator;