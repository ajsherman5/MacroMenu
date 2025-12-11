import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, UserProvider, OnboardingProvider } from './src/context';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UserProvider>
          <OnboardingProvider>
            <StatusBar style="light" />
            <AppNavigator />
          </OnboardingProvider>
        </UserProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
