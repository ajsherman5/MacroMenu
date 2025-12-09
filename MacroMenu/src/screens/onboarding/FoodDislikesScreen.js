import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import OnboardingLayout from '../../components/OnboardingLayout';
import SelectableChip from '../../components/SelectableChip';

const entrees = [
  'Hot Dog', 'Taco', 'Pizza', 'Pasta', 'Sandwich', 'Wrap',
  'Salad', 'Soup', 'Quesadilla'
];

const proteins = [
  'Pork', 'Seafood', 'Tofu', 'Lamb'
];

export default function FoodDislikesScreen({ navigation }) {
  const [selectedEntrees, setSelectedEntrees] = useState([]);
  const [selectedProteins, setSelectedProteins] = useState([]);

  const toggleEntree = (item) => {
    if (selectedEntrees.includes(item)) {
      setSelectedEntrees(selectedEntrees.filter((s) => s !== item));
    } else {
      setSelectedEntrees([...selectedEntrees, item]);
    }
  };

  const toggleProtein = (item) => {
    if (selectedProteins.includes(item)) {
      setSelectedProteins(selectedProteins.filter((s) => s !== item));
    } else {
      setSelectedProteins([...selectedProteins, item]);
    }
  };

  return (
    <OnboardingLayout
      progress={15 / 20}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('Allergies')}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What types of food DON'T you like?</Text>
        <Text style={styles.subtitle}>
          We'll filter these out of your recommendations. The more info you give us, the more accurate your recommendations will be.
        </Text>

        <Text style={styles.sectionTitle}>Entrees</Text>
        <View style={styles.chipContainer}>
          {entrees.map((item) => (
            <SelectableChip
              key={item}
              label={item}
              selected={selectedEntrees.includes(item)}
              onPress={() => toggleEntree(item)}
              showCheck={false}
            />
          ))}
        </View>

        <Text style={styles.sectionTitle}>Proteins</Text>
        <View style={styles.chipContainer}>
          {proteins.map((item) => (
            <SelectableChip
              key={item}
              label={item}
              selected={selectedProteins.includes(item)}
              onPress={() => toggleProtein(item)}
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
    marginTop: 20,
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 14,
    marginTop: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
});
