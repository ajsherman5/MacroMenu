import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboarding } from '../../context';

const allergies = [
  { id: 'dairy', label: 'Dairy', emoji: '🥛' },
  { id: 'eggs', label: 'Eggs', emoji: '🥚' },
  { id: 'fish', label: 'Fish', emoji: '🐟' },
  { id: 'gluten', label: 'Gluten', emoji: '🌾' },
  { id: 'peanuts', label: 'Peanuts', emoji: '🥜' },
  { id: 'sesame', label: 'Sesame', emoji: '🫘' },
  { id: 'shellfish', label: 'Shellfish', emoji: '🦐' },
  { id: 'soy', label: 'Soy', emoji: '🫛' },
  { id: 'treenuts', label: 'Tree Nuts', emoji: '🌰' },
  { id: 'wheat', label: 'Wheat', emoji: '🍞' },
];

const dietaryRestrictions = [
  { id: 'vegetarian', label: 'Vegetarian', emoji: '🥬' },
  { id: 'vegan', label: 'Vegan', emoji: '🌱' },
  { id: 'halal', label: 'Halal', emoji: '🍖' },
  { id: 'kosher', label: 'Kosher', emoji: '✡️' },
  { id: 'keto', label: 'Keto', emoji: '🥓' },
  { id: 'lowcarb', label: 'Low Carb', emoji: '📉' },
  { id: 'lowsodium', label: 'Low Sodium', emoji: '🧂' },
];

export default function AllergiesScreen({ navigation }) {
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [selectedDietary, setSelectedDietary] = useState([]);
  const { updateOnboarding } = useOnboarding();

  const handleContinue = () => {
    updateOnboarding({
      allergies: selectedAllergies,
      dietaryPreferences: selectedDietary,
    });
    navigation.navigate('SocialProof');
  };

  const toggleAllergy = (id) => {
    if (selectedAllergies.includes(id)) {
      setSelectedAllergies(selectedAllergies.filter((s) => s !== id));
    } else {
      setSelectedAllergies([...selectedAllergies, id]);
    }
  };

  const toggleDietary = (id) => {
    if (selectedDietary.includes(id)) {
      setSelectedDietary(selectedDietary.filter((s) => s !== id));
    } else {
      setSelectedDietary([...selectedDietary, id]);
    }
  };

  return (
    <OnboardingLayout
      progress={16 / 20}
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Any allergies or dietary needs?</Text>
        <Text style={styles.subtitle}>
          We take this seriously - these items will be strictly filtered out
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergies</Text>
          <View style={styles.chipContainer}>
            {allergies.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.chip,
                  selectedAllergies.includes(item.id) && styles.chipSelected,
                ]}
                onPress={() => toggleAllergy(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipEmoji}>{item.emoji}</Text>
                <Text
                  style={[
                    styles.chipLabel,
                    selectedAllergies.includes(item.id) && styles.chipLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <View style={styles.chipContainer}>
            {dietaryRestrictions.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.chip,
                  selectedDietary.includes(item.id) && styles.chipSelected,
                ]}
                onPress={() => toggleDietary(item.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.chipEmoji}>{item.emoji}</Text>
                <Text
                  style={[
                    styles.chipLabel,
                    selectedDietary.includes(item.id) && styles.chipLabelSelected,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.noteContainer}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.noteText}>
            No allergies? Just tap Continue to skip this step.
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 16,
  },
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
    marginBottom: 28,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  chipSelected: {
    borderColor: '#F87171',
    backgroundColor: '#FEF2F2',
  },
  chipEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  chipLabelSelected: {
    color: '#000',
    fontWeight: '600',
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
  },
  bottomPadding: {
    height: 20,
  },
});
