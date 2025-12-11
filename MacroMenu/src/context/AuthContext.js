import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  supabase,
  signInWithEmail,
  signUpWithEmail,
  signOut as supabaseSignOut,
  onAuthStateChange,
} from '../services/supabase';

const AuthContext = createContext();

const AUTH_KEY = '@macromenu_auth';
const ONBOARDING_COMPLETE_KEY = '@macromenu_onboarding_complete';

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,
    onboardingComplete: false,
  });

  // Check for existing auth on mount and listen for changes
  useEffect(() => {
    checkAuth();
    checkOnboardingStatus();

    // Subscribe to auth state changes from Supabase
    const subscription = onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setAuthState((prev) => ({
          ...prev,
          user: session.user,
          session,
          isAuthenticated: true,
          isLoading: false,
        }));
      } else if (event === 'SIGNED_OUT') {
        setAuthState((prev) => ({
          ...prev,
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        }));
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAuthState((prev) => ({
          ...prev,
          user: session.user,
          session,
          isAuthenticated: true,
          isLoading: false,
        }));
      } else {
        // Check for local auth (anonymous/guest mode)
        const stored = await AsyncStorage.getItem(AUTH_KEY);
        if (stored) {
          const { user } = JSON.parse(stored);
          setAuthState((prev) => ({
            ...prev,
            user,
            isAuthenticated: true,
            isLoading: false,
          }));
        } else {
          setAuthState((prev) => ({ ...prev, isLoading: false }));
        }
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const checkOnboardingStatus = async () => {
    try {
      const status = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      if (status === 'true') {
        setAuthState((prev) => ({ ...prev, onboardingComplete: true }));
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const signIn = async (email, password) => {
    try {
      const { user, session } = await signInWithEmail(email, password);
      setAuthState((prev) => ({
        ...prev,
        user,
        session,
        isAuthenticated: true,
        isLoading: false,
      }));
      return { user, session };
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const signUp = async (email, password) => {
    try {
      const { user, session } = await signUpWithEmail(email, password);
      setAuthState((prev) => ({
        ...prev,
        user,
        session,
        isAuthenticated: true,
        isLoading: false,
      }));
      return { user, session };
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabaseSignOut();
      await AsyncStorage.removeItem(AUTH_KEY);
      setAuthState({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        onboardingComplete: false,
      });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Continue as guest (skip sign in)
  const continueAsGuest = async () => {
    try {
      const guestUser = {
        id: `guest_${Date.now()}`,
        isGuest: true,
        createdAt: new Date().toISOString(),
      };
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user: guestUser }));
      setAuthState((prev) => ({
        ...prev,
        user: guestUser,
        isAuthenticated: true,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error continuing as guest:', error);
      throw error;
    }
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setAuthState((prev) => ({ ...prev, onboardingComplete: true }));
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETE_KEY);
      setAuthState((prev) => ({ ...prev, onboardingComplete: false }));
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn,
        signUp,
        signOut,
        continueAsGuest,
        completeOnboarding,
        resetOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
