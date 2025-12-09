import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout';
import OptionCard from '../../components/OptionCard';

const options = [
  { id: 'calories', label: 'Finding high-calorie affordable meals', icon: 'fire', iconType: 'material' },
  { id: 'protein', label: 'Getting enough protein', icon: 'food-turkey', iconType: 'material' },
  { id: 'healthy', label: "Don't know the healthy options", icon: 'food-apple-outline', iconType: 'material' },
];

export default function HardestPartScreen({ navigation, route }) {
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
      progress={2 / 20}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('HowDecide', { goal })}
      continueDisabled={selected.length === 0}
    >
      <Text style={styles.title}>When you eat out, what's the hardest part?</Text>
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
