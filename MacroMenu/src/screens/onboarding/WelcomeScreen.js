import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../context/UserContext';

export default function WelcomeScreen({ navigation }) {
  const { completeOnboarding, updateProfile } = useUser();

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
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logo}>MacroMenu</Text>
        <Text style={styles.tagline}>
          Know exactly what to order at any restaurant
        </Text>

        <View style={styles.features}>
          <Text style={styles.feature}>✓ Personalized meal recommendations</Text>
          <Text style={styles.feature}>✓ Works at 750,000+ restaurants</Text>
          <Text style={styles.feature}>✓ Hit your macros while eating out</Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Goal')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginLink}>Log in</Text>
        </Text>

        {/* DEV ONLY - Skip Onboarding Button */}
        <TouchableOpacity
          style={styles.devSkipButton}
          onPress={handleSkipOnboarding}
        >
          <Text style={styles.devSkipText}>Skip Onboarding (DEV)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4ADE80',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 24,
    color: '#fff',
    lineHeight: 32,
    marginBottom: 48,
  },
  features: {
  },
  feature: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  bottom: {
  },
  button: {
    backgroundColor: '#4ADE80',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  loginText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 14,
  },
  loginLink: {
    color: '#4ADE80',
  },
  devSkipButton: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  devSkipText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '500',
  },
});
