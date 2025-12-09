import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import OnboardingLayout from '../../components/OnboardingLayout';
import SelectableChip from '../../components/SelectableChip';

const allergies = [
  'Dairy', 'Eggs', 'Fish', 'Gluten', 'Milk', 'Peanuts',
  'Sesame', 'Shellfish', 'Soy', 'Tree Nuts', 'Wheat'
];

export default function AllergiesScreen({ navigation }) {
  const [selected, setSelected] = useState([]);

  const toggle = (item) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((s) => s !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  return (
    <OnboardingLayout
      progress={16 / 20}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('SocialProof')}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Got any allergies?</Text>
        <Text style={styles.subtitle}>
          We'll make sure to avoid meals that contain any of these.
        </Text>

        <View style={styles.chipContainer}>
          {allergies.map((item) => (
            <SelectableChip
              key={item}
              label={item}
              selected={selected.includes(item)}
              onPress={() => toggle(item)}
              showCheck={false}
            />
          ))}
        </View>
      </ScrollView>
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
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
