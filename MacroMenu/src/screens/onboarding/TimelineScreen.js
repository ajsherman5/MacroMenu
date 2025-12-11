import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import OptionCard from '../../components/OptionCard';
import { useOnboarding } from '../../context';

const options = [
  { id: '4', label: '4 weeks' },
  { id: '8', label: '8 weeks' },
  { id: '12+', label: '12+ weeks' },
  { id: 'none', label: 'No timeline' },
  { id: 'custom', label: 'Custom' },
];

export default function TimelineScreen({ navigation, route }) {
  const goal = route.params?.goal;
  const [selected, setSelected] = useState(null);
  const [customWeeks, setCustomWeeks] = useState('');
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef(null);
  const { updateOnboarding } = useOnboarding();

  const handleContinue = () => {
    const timeline = selected === 'custom' ? customWeeks : selected;
    updateOnboarding({ timeline });
    navigation.navigate('ActivityLevel', { goal });
  };

  const handleSelect = (id) => {
    setSelected(id);
    if (id !== 'custom') {
      setCustomWeeks('');
      Keyboard.dismiss();
    } else {
      // Scroll to make custom card fully visible above the continue button
      // First scroll happens after state update, second ensures it reaches the end
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 400);
    }
  };

  const isValid = selected && (selected !== 'custom' || (customWeeks && parseInt(customWeeks) > 0));

  return (
    <View style={styles.rootContainer}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: '45%' }]} />
            </View>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Your timeline to hit that goal?</Text>

          <View style={styles.options}>
            {options.map((option) => (
              <View key={option.id}>
                {option.id === 'custom' ? (
                  <TouchableOpacity
                    style={[
                      styles.customCard,
                      selected === 'custom' && styles.customCardSelected,
                    ]}
                    onPress={() => handleSelect('custom')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.customContent}>
                      <Ionicons
                        name="calendar-outline"
                        size={24}
                        color={selected === 'custom' ? '#000' : '#666'}
                      />
                      <Text style={[
                        styles.customLabel,
                        selected === 'custom' && styles.customLabelSelected,
                      ]}>
                        Custom
                      </Text>
                    </View>
                    {selected === 'custom' && (
                      <View style={styles.inputContainer}>
                        <TextInput
                          style={styles.input}
                          placeholder="Enter weeks"
                          placeholderTextColor="#999"
                          keyboardType="number-pad"
                          value={customWeeks}
                          onChangeText={(text) => setCustomWeeks(text.replace(/[^0-9]/g, ''))}
                          maxLength={3}
                          autoFocus
                        />
                        <Text style={styles.inputSuffix}>weeks</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ) : (
                  <OptionCard
                    icon="calendar-outline"
                    title={option.label}
                    selected={selected === option.id}
                    onPress={() => handleSelect(option.id)}
                  />
                )}
              </View>
            ))}
          </View>

        </ScrollView>

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity
              style={[styles.button, !isValid && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={!isValid}
            >
              <Text style={[styles.buttonText, !isValid && styles.buttonTextDisabled]}>
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardAvoid: {
    flex: 1,
    backgroundColor: 'transparent',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    flexGrow: 1,
    paddingBottom: 9,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 60,
    lineHeight: 36,
  },
  options: {
    marginTop: 20,
  },
  customCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  customCardSelected: {
    borderColor: '#000',
  },
  customContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customLabel: {
    fontSize: 17,
    fontWeight: '500',
    color: '#666',
    marginLeft: 14,
  },
  customLabelSelected: {
    color: '#000',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  inputSuffix: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: 'transparent',
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
