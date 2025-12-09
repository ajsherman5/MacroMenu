import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const restrictions = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥬' },
  { id: 'vegan', label: 'Vegan', icon: '🌱' },
  { id: 'gluten', label: 'Gluten-Free', icon: '🌾' },
  { id: 'dairy', label: 'Dairy-Free', icon: '🥛' },
  { id: 'keto', label: 'Keto', icon: '🥑' },
  { id: 'halal', label: 'Halal', icon: '🍖' },
  { id: 'kosher', label: 'Kosher', icon: '✡️' },
  { id: 'nuts', label: 'Nut Allergy', icon: '🥜' },
  { id: 'shellfish', label: 'Shellfish Allergy', icon: '🦐' },
  { id: 'soy', label: 'Soy-Free', icon: '🫘' },
];

export default function RestrictionsScreen({ navigation }) {
  const [selected, setSelected] = useState([]);

  const toggle = (id) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((s) => s !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.step}>3 of 5</Text>
          <Text style={styles.title}>Dietary restrictions?</Text>
          <Text style={styles.subtitle}>Select all that apply (or skip)</Text>
        </View>

        <View style={styles.grid}>
          {restrictions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.option,
                selected.includes(item.id) && styles.optionSelected,
              ]}
              onPress={() => toggle(item.id)}
            >
              <Text style={styles.optionIcon}>{item.icon}</Text>
              <Text style={styles.optionLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Preferences')}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scroll: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  step: {
    fontSize: 14,
    color: '#4ADE80',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  option: {
    width: '47%',
    marginBottom: 12,
    backgroundColor: '#1F1F1F',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1F1F1F',
  },
  optionSelected: {
    borderColor: '#4ADE80',
    backgroundColor: '#1a2e1a',
  },
  optionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
  bottom: {
    padding: 24,
    paddingTop: 16,
  },
  button: {
    backgroundColor: '#4ADE80',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});
