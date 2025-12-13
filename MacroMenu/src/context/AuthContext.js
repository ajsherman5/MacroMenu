import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isSupabaseConfigured } from '../services/supabase/config';

// Only import Supabase functions if configured
let supabase = null;
let signInWithEmail = null;
let signUpWithEmail = null;
let supabaseSignOut = null;
let onAuthStateChange = null;

if (isSupabaseConfigured) {
  const supabaseModule = require('../services/supabase');
  supabase = supabaseModule.supabase;
  signInWithEmail = supabaseModule.signInWithEmail;
  signUpWithEmail = supabaseModule.signUpWithEmail;
  supabaseSignOut = supabaseModule.signOut;
  onAuthStateChange = supabaseModule.onAuthStateChange;
}

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

    // Subscribe to auth state changes from Supabase (only if configured)
    let subscription = null;
    if (isSupabaseConfigured && onAuthStateChange) {
      subscription = onAuthStateChange((event, session) => {
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
    }

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const checkAuth = async () => {
    try {
      // Try Supabase auth first if configured
      if (isSupabaseConfigured && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setAuthState((prev) => ({
            ...prev,
            user: session.user,
            session,
            isAuthenticated: true,
            isLoading: false,
          }));
          return;
        }
      }

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
      if (!isSupabaseConfigured || !signInWithEmail) {
        // Mock sign in for development
        const mockUser = { id: `user_${Date.now()}`, email };
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user: mockUser }));
        setAuthState((prev) => ({
          ...prev,
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
        }));
        return { user: mockUser, session: null };
      }
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
      if (!isSupabaseConfigured || !signUpWithEmail) {
        // Mock sign up for development
        const mockUser = { id: `user_${Date.now()}`, email };
        await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user: mockUser }));
        setAuthState((prev) => ({
          ...prev,
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
        }));
        return { user: mockUser, session: null };
      }
      const result = await signUpWithEmail(email, password);
      console.log('[AuthContext] SignUp result:', JSON.stringify(result, null, 2));

      // Supabase may not return a session if email confirmation is required
      // In that case, we need to sign in immediately after signup
      let user = result.user;
      let session = result.session;

      if (!session && user) {
        console.log('[AuthContext] No session after signup, signing in...');
        const signInResult = await signInWithEmail(email, password);
        user = signInResult.user;
        session = signInResult.session;
        console.log('[AuthContext] SignIn after signup result:', JSON.stringify(signInResult, null, 2));
      }

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
      if (isSupabaseConfigured && supabaseSignOut) {
        await supabaseSignOut();
      }
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
