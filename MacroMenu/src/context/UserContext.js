import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

const STORAGE_KEY = '@macromenu_user';

const defaultUser = {
  profile: {
    goal: null, // 'bulk', 'cut', 'maintain'
    gender: null,
    height: null, // in inches
    currentWeight: null,
    goalWeight: null,
    timeline: null,
    activityLevel: null,
    eatingStyle: null,
    daysEatingOut: null,
  },
  preferences: {
    favoriteRestaurants: [],
    foodLikes: {
      cuisines: [],
      entrees: [],
      proteins: [],
      sides: [],
      flavors: [],
    },
    foodDislikes: {
      cuisines: [],
      entrees: [],
      proteins: [],
      sides: [],
      flavors: [],
    },
  },
  restrictions: {
    allergies: [],
    dietaryPreferences: [],
  },
  macros: {
    calories: null,
    protein: null,
    carbs: null,
    fat: null,
  },
  recentRestaurants: [],
  onboardingComplete: false,
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(defaultUser);
  const [loading, setLoading] = useState(true);

  // Load user data from storage on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (updatedUser) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const updateProfile = (profileData) => {
    const updated = {
      ...user,
      profile: { ...user.profile, ...profileData },
    };
    setUser(updated);
    saveUser(updated);
  };

  const updatePreferences = (preferencesData) => {
    const updated = {
      ...user,
      preferences: { ...user.preferences, ...preferencesData },
    };
    setUser(updated);
    saveUser(updated);
  };

  const updateRestrictions = (restrictionsData) => {
    const updated = {
      ...user,
      restrictions: { ...user.restrictions, ...restrictionsData },
    };
    setUser(updated);
    saveUser(updated);
  };

  const updateMacros = (macrosData) => {
    const updated = {
      ...user,
      macros: { ...user.macros, ...macrosData },
    };
    setUser(updated);
    saveUser(updated);
  };

  const addRecentRestaurant = (restaurant) => {
    const filtered = user.recentRestaurants.filter((r) => r.id !== restaurant.id);
    const updated = {
      ...user,
      recentRestaurants: [restaurant, ...filtered].slice(0, 10), // Keep last 10
    };
    setUser(updated);
    saveUser(updated);
  };

  const completeOnboarding = () => {
    const updated = { ...user, onboardingComplete: true };
    setUser(updated);
    saveUser(updated);
  };

  const resetUser = async () => {
    setUser(defaultUser);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        updateProfile,
        updatePreferences,
        updateRestrictions,
        updateMacros,
        addRecentRestaurant,
        completeOnboarding,
        resetUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
