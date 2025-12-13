import React from 'react';
import { View, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Main screens
import HomeScreen from '../screens/main/HomeScreen';
import NearbyScreen from '../screens/main/NearbyScreen';
import RecommendedScreen from '../screens/main/RecommendedScreen';
import AIChatScreen from '../screens/main/AIChatScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

function TabBarIcon({ name, focused, color }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons
        name={focused ? name : `${name}-outline`}
        size={24}
        color={color}
      />
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          height: Platform.OS === 'ios' ? 88 : 68,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="home" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Nearby"
        component={NearbyScreen}
        options={{
          tabBarLabel: 'Nearby',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="location" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Recommended"
        component={RecommendedScreen}
        options={{
          tabBarLabel: 'For You',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="star" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AIChat"
        component={AIChatScreen}
        options={{
          tabBarLabel: 'AI',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="sparkles" focused={focused} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon name="person" focused={focused} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
