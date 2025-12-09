import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Keyboard, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function OnboardingLayout({
  children,
  progress,
  onBack,
  onContinue,
  continueText = 'Continue',
  continueDisabled = false,
  showBack = true,
  showContinue = true,
}) {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        {showBack ? (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {children}
      </View>

      {showContinue && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity
            style={[styles.button, continueDisabled && styles.buttonDisabled]}
            onPress={onContinue}
            disabled={continueDisabled}
          >
            <Text style={[styles.buttonText, continueDisabled && styles.buttonTextDisabled]}>
              {continueText}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
    marginLeft: 12,
  },
  progressBg: {
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#000',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  footer: {
    paddingHorizontal: 24,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#E5E5E5',
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  buttonTextDisabled: {
    color: '#999',
  },
});
