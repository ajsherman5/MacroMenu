import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const goals = [
  { id: 'lose', title: 'Lose Fat', desc: 'Cut weight while keeping muscle', icon: '🔥' },
  { id: 'gain', title: 'Build Muscle', desc: 'Gain size and strength', icon: '💪' },
  { id: 'maintain', title: 'Maintain', desc: 'Stay where you are', icon: '⚖️' },
];

export default function GoalScreen({ navigation }) {
  const [selected, setSelected] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.step}>1 of 5</Text>
        <Text style={styles.title}>What's your goal?</Text>
        <Text style={styles.subtitle}>We'll personalize your recommendations</Text>
      </View>

      <View style={styles.options}>
        {goals.map((goal) => (
          <TouchableOpacity
            key={goal.id}
            style={[
              styles.option,
              selected === goal.id && styles.optionSelected,
            ]}
            onPress={() => setSelected(goal.id)}
          >
            <Text style={styles.optionIcon}>{goal.icon}</Text>
            <View style={styles.optionText}>
              <Text style={styles.optionTitle}>{goal.title}</Text>
              <Text style={styles.optionDesc}>{goal.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.button, !selected && styles.buttonDisabled]}
          onPress={() => selected && navigation.navigate('Stats')}
          disabled={selected ? false : true}
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
  options: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1F1F1F',
    marginBottom: 16,
  },
  optionSelected: {
    borderColor: '#4ADE80',
  },
  optionIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  bottom: {
    paddingTop: 16,
  },
  button: {
    backgroundColor: '#4ADE80',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#374151',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});
