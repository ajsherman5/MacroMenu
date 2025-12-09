import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SummaryScreen({ navigation }) {
  // These would come from stored onboarding data
  const calories = 2150;
  const protein = 180;
  const carbs = 215;
  const fat = 72;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.step}>5 of 5</Text>
          <Text style={styles.title}>Your daily targets</Text>
          <Text style={styles.subtitle}>Based on your goal and stats</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.calorieSection}>
            <Text style={styles.calorieNumber}>{calories}</Text>
            <Text style={styles.calorieLabel}>calories / day</Text>
          </View>

          <View style={styles.macrosRow}>
            <View style={styles.macro}>
              <Text style={styles.macroValue}>{protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
              <View style={[styles.macroBar, styles.proteinBar]} />
            </View>
            <View style={styles.macro}>
              <Text style={styles.macroValue}>{carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
              <View style={[styles.macroBar, styles.carbsBar]} />
            </View>
            <View style={styles.macro}>
              <Text style={styles.macroValue}>{fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
              <View style={[styles.macroBar, styles.fatBar]} />
            </View>
          </View>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            We'll recommend meals that fit these targets at any restaurant.
          </Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Paywall')}
        >
          <Text style={styles.buttonText}>See My Plan</Text>
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
  content: {
    flex: 1,
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
  card: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  calorieSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  calorieNumber: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#4ADE80',
  },
  calorieLabel: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macro: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  macroLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
    marginBottom: 8,
  },
  macroBar: {
    height: 4,
    width: '80%',
    borderRadius: 2,
  },
  proteinBar: {
    backgroundColor: '#EF4444',
  },
  carbsBar: {
    backgroundColor: '#3B82F6',
  },
  fatBar: {
    backgroundColor: '#F59E0B',
  },
  info: {
    backgroundColor: '#1a2e1a',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4ADE80',
  },
  infoText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 20,
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
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});
