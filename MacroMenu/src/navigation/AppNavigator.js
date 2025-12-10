import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Onboarding screens - new flow
import SplashScreen from '../screens/onboarding/SplashScreen';
import GoalSelectionScreen from '../screens/onboarding/GoalSelectionScreen';
import DaysEatingOutScreen from '../screens/onboarding/DaysEatingOutScreen';
import HardestPartScreen from '../screens/onboarding/HardestPartScreen';
import HowDecideScreen from '../screens/onboarding/HowDecideScreen';
import HeresTheTruthScreen from '../screens/onboarding/HeresTheTruthScreen';
import GenderScreen from '../screens/onboarding/GenderScreen';
import HeightScreen from '../screens/onboarding/HeightScreen';
import WeightScreen from '../screens/onboarding/WeightScreen';
import GoalWeightScreen from '../screens/onboarding/GoalWeightScreen';
import TimelineScreen from '../screens/onboarding/TimelineScreen';
import ActivityLevelScreen from '../screens/onboarding/ActivityLevelScreen';
import EatingStyleScreen from '../screens/onboarding/EatingStyleScreen';
import EveryRestaurantScreen from '../screens/onboarding/EveryRestaurantScreen';
import FavoriteSpotsScreen from '../screens/onboarding/FavoriteSpotsScreen';
import FoodLikesScreen from '../screens/onboarding/FoodLikesScreen';
import FoodDislikesScreen from '../screens/onboarding/FoodDislikesScreen';
import AllergiesScreen from '../screens/onboarding/AllergiesScreen';
import SocialProofScreen from '../screens/onboarding/SocialProofScreen';
import LoadingScreen from '../screens/onboarding/LoadingScreen';
import SignInScreen from '../screens/onboarding/SignInScreen';
import PaywallScreen from '../screens/onboarding/PaywallScreen';

// Main app screens
import HomeScreen from '../screens/main/HomeScreen';
import RestaurantResultsScreen from '../screens/main/RestaurantResultsScreen';
import RestaurantDetailScreen from '../screens/main/RestaurantDetailScreen';
import MealDetailScreen from '../screens/main/MealDetailScreen';
import AIChatScreen from '../screens/main/AIChatScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F9F9F9' },
        }}
      >
        {/* Onboarding Flow */}
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="GoalSelection" component={GoalSelectionScreen} />
        <Stack.Screen name="DaysEatingOut" component={DaysEatingOutScreen} />
        <Stack.Screen name="HardestPart" component={HardestPartScreen} />
        <Stack.Screen name="HowDecide" component={HowDecideScreen} />
        <Stack.Screen name="HeresTheTruth" component={HeresTheTruthScreen} />
        <Stack.Screen name="Gender" component={GenderScreen} />
        <Stack.Screen name="Height" component={HeightScreen} />
        <Stack.Screen name="Weight" component={WeightScreen} />
        <Stack.Screen name="GoalWeight" component={GoalWeightScreen} />
        <Stack.Screen
          name="Timeline"
          component={TimelineScreen}
          options={{ contentStyle: { backgroundColor: '#F9F9F9' } }}
        />
        <Stack.Screen name="ActivityLevel" component={ActivityLevelScreen} />
        <Stack.Screen name="EatingStyle" component={EatingStyleScreen} />
        <Stack.Screen name="EveryRestaurant" component={EveryRestaurantScreen} />
        <Stack.Screen name="FavoriteSpots" component={FavoriteSpotsScreen} />
        <Stack.Screen name="FoodLikes" component={FoodLikesScreen} />
        <Stack.Screen name="FoodDislikes" component={FoodDislikesScreen} />
        <Stack.Screen name="Allergies" component={AllergiesScreen} />
        <Stack.Screen name="SocialProof" component={SocialProofScreen} />
        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />

        {/* Main App */}
        <Stack.Screen name="MainApp" component={HomeScreen} />
        <Stack.Screen name="RestaurantResults" component={RestaurantResultsScreen} />
        <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} />
        <Stack.Screen name="MealDetail" component={MealDetailScreen} />
        <Stack.Screen name="AIChat" component={AIChatScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
