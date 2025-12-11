import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout';
import OptionCard from '../../components/OptionCard';
import { useOnboarding } from '../../context';

const options = [
  { id: '1-2', label: '1-2 Days' },
  { id: '3-4', label: '3-4 Days' },
  { id: '5+', label: '5+ Days' },
];

export default function DaysEatingOutScreen({ navigation, route }) {
  const [selected, setSelected] = useState(null);
  const goal = route.params?.goal;
  const { updateOnboarding } = useOnboarding();

  const handleContinue = () => {
    updateOnboarding({ daysEatingOut: selected });
    navigation.navigate('HardestPart', { goal });
  };

  return (
    <OnboardingLayout
      progress={1 / 20}
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      continueDisabled={!selected}
    >
      <Text style={styles.title}>How many days per week do you eat out?</Text>

      <View style={styles.options}>
        {options.map((option) => (
          <OptionCard
            key={option.id}
            icon="calendar-outline"
            title={option.label}
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
    marginBottom: 60,
    lineHeight: 36,
  },
  options: {
    marginTop: 20,
  },
});
