import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import OnboardingLayout from '../../components/OnboardingLayout';
import SelectableChip from '../../components/SelectableChip';

const entrees = [
  'Burger', 'Hot Dog', 'Taco', 'Burrito', 'Bowl', 'Pizza',
  'Pasta', 'Sandwich', 'Wrap', 'Salad', 'Soup', 'Quesadilla'
];

const proteins = [
  'Chicken', 'Beef', 'Pork', 'Seafood', 'Tofu', 'Lamb', 'Turkey'
];

export default function FoodLikesScreen({ navigation }) {
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
      progress={14 / 20}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('FoodDislikes')}
      continueDisabled={selectedEntrees.length === 0 && selectedProteins.length === 0}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>What types of food do you love to eat?</Text>
        <Text style={styles.subtitle}>
          Select your favorite foods and ingredients. The more info you give us, the more accurate your recommendations will be.
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
