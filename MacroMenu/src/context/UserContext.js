import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserProfile, saveUserProfile } from '../services/supabase/database';
import { isSupabaseConfigured } from '../services/supabase/config';

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
  const [authUserId, setAuthUserId] = useState(null);
  const [syncEnabled, setSyncEnabled] = useState(false);

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

  // Load user data from cloud (called after sign in)
  const loadUserFromCloud = useCallback(async (userId) => {
    if (!userId || !isSupabaseConfigured) {
      console.log('[UserContext] Cloud sync not available');
      return false;
    }

    try {
      console.log('[UserContext] Loading user data from cloud...');
      const cloudData = await fetchUserProfile(userId);

      if (cloudData) {
        console.log('[UserContext] Found cloud data, merging with local');
        // Cloud data exists - use it (cloud is source of truth)
        const mergedUser = {
          ...defaultUser,
          ...cloudData,
        };
        setUser(mergedUser);
        setAuthUserId(userId);
        setSyncEnabled(true);

        // Also save to local storage as cache
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mergedUser));
        return true;
      } else {
        console.log('[UserContext] No cloud data found, using local');
        // No cloud data - user is new or hasn't completed onboarding yet
        setAuthUserId(userId);
        setSyncEnabled(true);
        return false;
      }
    } catch (error) {
      console.error('[UserContext] Error loading from cloud:', error);
      return false;
    }
  }, []);

  // Set auth user ID (called from AuthContext after sign in)
  const setAuthUser = useCallback((userId, isGuest = false) => {
    if (isGuest) {
      // Guest users don't sync to cloud
      setAuthUserId(null);
      setSyncEnabled(false);
    } else {
      setAuthUserId(userId);
      setSyncEnabled(isSupabaseConfigured);
    }
  }, []);

  // Save to local storage and optionally to cloud
  const saveUser = async (updatedUser) => {
    try {
      // Always save locally first (for offline support)
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      // Sync to cloud if user is authenticated (not guest)
      if (syncEnabled && authUserId) {
        saveUserProfile(authUserId, updatedUser).catch((error) => {
          console.error('[UserContext] Cloud sync failed:', error);
        });
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  // Force sync current user data to cloud
  // Can optionally pass userData directly to avoid race conditions with state updates
  const syncToCloud = async (userData = null) => {
    if (!syncEnabled || !authUserId) {
      console.log('[UserContext] Sync not available');
      return false;
    }

    try {
      const dataToSync = userData || user;
      console.log('[UserContext] Syncing data:', JSON.stringify(dataToSync.profile, null, 2));
      const success = await saveUserProfile(authUserId, dataToSync);
      console.log('[UserContext] Force sync result:', success);
      return success;
    } catch (error) {
      console.error('[UserContext] Force sync failed:', error);
      return false;
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

  const toggleFavoriteRestaurant = (restaurant) => {
    const currentFavorites = user.preferences.favoriteRestaurants || [];
    const isFavorite = currentFavorites.some((r) => r.id === restaurant.id);

    let newFavorites;
    if (isFavorite) {
      // Remove from favorites
      newFavorites = currentFavorites.filter((r) => r.id !== restaurant.id);
    } else {
      // Add to favorites
      newFavorites = [...currentFavorites, restaurant];
    }

    const updated = {
      ...user,
      preferences: {
        ...user.preferences,
        favoriteRestaurants: newFavorites,
      },
    };
    setUser(updated);
    saveUser(updated);
  };

  const isFavoriteRestaurant = (restaurantId) => {
    const currentFavorites = user.preferences.favoriteRestaurants || [];
    return currentFavorites.some((r) => r.id === restaurantId);
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
        authUserId,
        syncEnabled,
        updateProfile,
        updatePreferences,
        updateRestrictions,
        updateMacros,
        addRecentRestaurant,
        toggleFavoriteRestaurant,
        isFavoriteRestaurant,
        completeOnboarding,
        resetUser,
        // Cloud sync functions
        setAuthUser,
        loadUserFromCloud,
        syncToCloud,
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
