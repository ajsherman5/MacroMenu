import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout';
import OptionCard from '../../components/OptionCard';

const options = [
  { id: 'none', label: 'No preference', subtitle: 'Balanced diet', icon: 'restaurant-outline' },
  { id: 'keto', label: 'Keto', subtitle: 'Zero carbs', icon: 'flame-outline' },
  { id: 'carnivore', label: 'Carnivore', subtitle: 'Only meat', icon: 'nutrition-outline' },
  { id: 'gluten', label: 'Gluten free', subtitle: 'Zero gluten', icon: 'leaf-outline' },
  { id: 'vegan', label: 'Vegan', subtitle: 'No meat', icon: 'flower-outline' },
];

export default function EatingStyleScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  return (
    <OnboardingLayout
      progress={11 / 20}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('EveryRestaurant')}
      continueDisabled={!selected}
    >
      <Text style={styles.title}>Which best describes your eating style?</Text>

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
