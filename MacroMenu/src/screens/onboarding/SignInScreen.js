import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context';

export default function SignInScreen({ navigation }) {
  const [mode, setMode] = useState('options'); // 'options', 'signin', 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, continueAsGuest } = useAuth();

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      navigation.navigate('Paywall');
    } catch (error) {
      Alert.alert(
        'Error',
        error.message || 'Authentication failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = async () => {
    setLoading(true);
    try {
      await continueAsGuest();
      navigation.navigate('Paywall');
    } catch (error) {
      Alert.alert('Error', 'Failed to continue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderOptions = () => (
    <>
      <Text style={styles.logo}>MacroMenu</Text>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.subtitle}>
        Sign in to save your progress and access your personalized meal
        recommendations.
      </Text>

      <View style={styles.buttons}>
        <TouchableOpacity
          style={styles.appleButton}
          onPress={() => {
            // Apple Sign In will be implemented later
            Alert.alert('Coming Soon', 'Apple Sign In will be available soon!');
          }}
        >
          <Ionicons name="logo-apple" size={22} color="#fff" />
          <Text style={styles.appleButtonText}>Continue with Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={() => {
            // Google Sign In will be implemented later
            Alert.alert('Coming Soon', 'Google Sign In will be available soon!');
          }}
        >
          <Ionicons name="logo-google" size={20} color="#000" />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.emailButton}
          onPress={() => setMode('signup')}
        >
          <Ionicons name="mail-outline" size={20} color="#000" />
          <Text style={styles.emailButtonText}>Continue with Email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleContinueAsGuest}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#666" />
          ) : (
            <Text style={styles.skipButtonText}>Skip for now</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.signinLink}>
        <Text style={styles.signinLinkText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => setMode('signin')}>
          <Text style={styles.signinLinkAction}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderEmailForm = () => (
    <>
      <Text style={styles.logo}>MacroMenu</Text>
      <Text style={styles.title}>
        {mode === 'signin' ? 'Welcome back' : 'Create account'}
      </Text>
      <Text style={styles.subtitle}>
        {mode === 'signin'
          ? 'Sign in to access your personalized recommendations.'
          : 'Sign up to save your progress and preferences.'}
      </Text>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#999"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleEmailAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchModeButton}
          onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          <Text style={styles.switchModeText}>
            {mode === 'signin'
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backToOptionsButton}
          onPress={() => setMode('options')}
        >
          <Text style={styles.backToOptionsText}>Back to options</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (mode === 'options') {
                navigation.goBack();
              } else {
                setMode('options');
              }
            }}
          >
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>

          <View style={styles.content}>
            {mode === 'options' ? renderOptions() : renderEmailForm()}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  buttons: {
    marginTop: 10,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 18,
    borderRadius: 30,
    marginBottom: 14,
  },
  appleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 10,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 14,
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginLeft: 10,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 14,
  },
  emailButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginLeft: 10,
  },
  skipButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    marginTop: 10,
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  signinLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signinLinkText: {
    fontSize: 14,
    color: '#666',
  },
  signinLinkAction: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  form: {
    marginTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 16,
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#000',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  switchModeButton: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 10,
  },
  switchModeText: {
    fontSize: 14,
    color: '#666',
  },
  backToOptionsButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  backToOptionsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 30,
  },
  termsText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: '#666',
    textDecorationLine: 'underline',
  },
});
