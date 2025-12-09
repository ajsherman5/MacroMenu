import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function SignInScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={24} color="#000" />
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.logo}>MacroMenu</Text>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Sign in to save your progress and access your personalized meal recommendations.</Text>

        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.appleButton}
            onPress={() => navigation.navigate('Paywall')}
          >
            <Ionicons name="logo-apple" size={22} color="#fff" />
            <Text style={styles.appleButtonText}>Continue with Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={() => navigation.navigate('Paywall')}
          >
            <Ionicons name="logo-google" size={20} color="#000" />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' '}and{' '}
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
  backButton: {
    position: 'absolute',
    top: 60,
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
    marginBottom: 50,
  },
  buttons: {
    marginTop: 20,
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
  },
  googleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginLeft: 10,
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
