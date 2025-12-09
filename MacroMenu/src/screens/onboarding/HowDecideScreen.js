import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout';
import OptionCard from '../../components/OptionCard';

const options = [
  { id: 'looks', label: 'Whatever looks good', icon: 'eye-outline' },
  { id: 'healthy', label: "Something I think is 'healthy'", icon: 'leaf' },
  { id: 'always', label: 'What I always get', icon: 'repeat' },
  { id: 'macros', label: 'I check calories/macros first', icon: 'calculator-variant-outline' },
];

export default function HowDecideScreen({ navigation, route }) {
  const [selected, setSelected] = useState([]);
  const goal = route.params?.goal;

  const toggle = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <OnboardingLayout
      progress={3 / 20}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('HeresTheTruth', { goal })}
      continueDisabled={selected.length === 0}
    >
      <Text style={styles.title}>How do you usually decide what to order?</Text>
      <Text style={styles.subtitle}>Select all that apply.</Text>

      <View style={styles.options}>
        {options.map((option) => (
          <OptionCard
            key={option.id}
            iconComponent={<MaterialCommunityIcons name={option.icon} size={26} color="#000" />}
            title={option.label}
            selected={selected.includes(option.id)}
            onPress={() => toggle(option.id)}
            showRadio={true}
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
    marginTop: 20,
  },
});
