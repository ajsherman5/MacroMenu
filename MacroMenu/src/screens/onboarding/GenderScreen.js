import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout';
import OptionCard from '../../components/OptionCard';

const options = [
  { id: 'male', label: 'Male', icon: 'male-outline' },
  { id: 'female', label: 'Female', icon: 'female-outline' },
  { id: 'other', label: 'Other', icon: 'body-outline' },
];

export default function GenderScreen({ navigation, route }) {
  const [selected, setSelected] = useState(null);
  const goal = route.params?.goal;

  return (
    <OnboardingLayout
      progress={5 / 20}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('Height', { goal })}
      continueDisabled={!selected}
    >
      <Text style={styles.title}>Choose your Gender</Text>
      <Text style={styles.subtitle}>
        This will be used to calibrate your custom calories and macros.
      </Text>

      <View style={styles.options}>
        {options.map((option) => (
          <OptionCard
            key={option.id}
            iconComponent={<Ionicons name={option.icon} size={26} color="#000" />}
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
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  options: {
    marginTop: 40,
  },
});
