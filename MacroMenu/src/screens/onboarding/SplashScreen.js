import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';

export default function SplashScreen({ navigation }) {
  const { user, loading: userLoading, completeOnboarding, updateProfile } = useUser();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user should skip to main app
  useEffect(() => {
    if (!authLoading && !userLoading) {
      // If user has completed onboarding, go straight to main app
      if (user?.onboardingComplete) {
        console.log('[SplashScreen] User has completed onboarding, going to MainApp');
        navigation.replace('MainApp');
        return;
      }
      setCheckingAuth(false);
    }
  }, [authLoading, userLoading, user?.onboardingComplete, navigation]);

  const handleSkipOnboarding = () => {
    // Set some default profile data for testing
    updateProfile({
      goal: 'cut',
      gender: 'male',
      age: 28,
      height: 70, // 5'10"
      currentWeight: 180,
      targetWeight: 170,
      activityLevel: 'moderate',
    });
    completeOnboarding();
    // Navigate directly to main app
    navigation.replace('MainApp');
  };
  const [showButton, setShowButton] = useState(false);

  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Don't start animations until we've checked auth
    if (checkingAuth) return;

    // Sequence of animations
    Animated.sequence([
      // First: Ring appears and scales
      Animated.parallel([
        Animated.timing(ringOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(ringScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      // Second: Logo icon appears with bounce
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // Third: App name fades in and slides up
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Fourth: Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Show button after animations complete
      setShowButton(true);
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(buttonTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [checkingAuth]);

  const handleGetStarted = () => {
    navigation.replace('GoalSelection');
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Animated ring behind logo */}
        <Animated.View
          style={[
            styles.ring,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />

        {/* Logo icon */}
        <Animated.View
          style={[
            styles.logoCircle,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Ionicons name="restaurant" size={48} color="#fff" />
        </Animated.View>
      </View>

      {/* App name */}
      <Animated.Text
        style={[
          styles.appName,
          {
            opacity: textOpacity,
            transform: [{ translateY: textTranslateY }],
          },
        ]}
      >
        MacroMenu
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        style={[
          styles.tagline,
          {
            opacity: taglineOpacity,
          },
        ]}
      >
        Eat smart. Anywhere.
      </Animated.Text>

      {/* Get Started Button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: buttonOpacity,
            transform: [{ translateY: buttonTranslateY }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={handleGetStarted}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={20} color="#000" style={styles.buttonIcon} />
        </TouchableOpacity>

        {/* Sign In link for returning users */}
        <TouchableOpacity
          style={styles.signInButton}
          onPress={handleSignIn}
        >
          <Text style={styles.signInText}>Already have an account? <Text style={styles.signInLink}>Sign In</Text></Text>
        </TouchableOpacity>

        {/* DEV ONLY - Skip Onboarding Button */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.devSkipButton}
            onPress={handleSkipOnboarding}
          >
            <Text style={styles.devSkipText}>Skip Onboarding (DEV)</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#000',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 42,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
    letterSpacing: 2,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 60,
    left: 24,
    right: 24,
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  signInButton: {
    marginTop: 20,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signInText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 15,
  },
  signInLink: {
    color: '#fff',
    fontWeight: '600',
  },
  devSkipButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F59E0B',
    alignItems: 'center',
  },
  devSkipText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '500',
  },
});
