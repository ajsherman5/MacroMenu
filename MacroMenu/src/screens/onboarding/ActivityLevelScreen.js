import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout';
import OptionCard from '../../components/OptionCard';

const options = [
  { id: 'sedentary', label: 'Sedentary', subtitle: 'No activity', icon: 'person-outline' },
  { id: 'light', label: 'Light Activity', subtitle: '1-2x/week', icon: 'walk-outline' },
  { id: 'moderate', label: 'Moderate Activity', subtitle: '3-4x/week', icon: 'bicycle-outline' },
  { id: 'active', label: 'Active', subtitle: 'Workout 5+ x/week', icon: 'barbell-outline' },
  { id: 'very-active', label: 'Very Active', subtitle: 'Athlete, physical job', icon: 'fitness-outline' },
];

export default function ActivityLevelScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  return (
    <OnboardingLayout
      progress={10 / 20}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('EatingStyle')}
      continueDisabled={!selected}
    >
      <Text style={styles.title}>Activity Level</Text>

      <View style={styles.options}>
        {options.map((option) => (
          <OptionCard
            key={option.id}
            icon={option.icon}
            title={option.label}
            subtitle={option.subtitle}
            selected={selected === option.id}
            onPress={() => setSelected(option.id)}
          />
        ))}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 40,
    lineHeight: 36,
  },
  options: {
    marginTop: 0,
  },
});
