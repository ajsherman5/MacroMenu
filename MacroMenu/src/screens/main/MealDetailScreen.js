import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MealDetailScreen({ navigation, route }) {
  const meal = route?.params?.meal || {
    name: 'Chicken Burrito Bowl',
    match: 95,
    calories: 660,
    protein: 52,
    carbs: 54,
    fat: 18,
    description: 'Chicken, rice, black beans, fajita veggies, salsa'
  };

  const healthifyTips = [
    { tip: 'Skip the rice', saves: '-180 cal, -36g carbs' },
    { tip: 'No cheese', saves: '-110 cal, -9g fat' },
    { tip: 'Double protein', adds: '+180 cal, +32g protein' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.mealHeader}>
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{meal.match}% match</Text>
          </View>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.mealDescription}>{meal.description}</Text>
        </View>

        <View style={styles.macrosCard}>
          <Text style={styles.macrosTitle}>Nutrition Facts</Text>

          <View style={styles.calorieRow}>
            <Text style={styles.calorieLabel}>Calories</Text>
            <Text style={styles.calorieValue}>{meal.calories}</Text>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, styles.proteinBar, { width: `${(meal.protein / 60) * 100}%` }]} />
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{meal.protein}g</Text>
            </View>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, styles.carbsBar, { width: `${(meal.carbs / 100) * 100}%` }]} />
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{meal.carbs}g</Text>
            </View>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, styles.fatBar, { width: `${(meal.fat / 40) * 100}%` }]} />
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={styles.macroValue}>{meal.fat}g</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 Healthify This Meal</Text>
          <Text style={styles.sectionSubtitle}>Modifications to fit your goals better</Text>

          {healthifyTips.map((item, index) => (
            <View key={index} style={styles.tipCard}>
              <Text style={styles.tipText}>{item.tip}</Text>
              <Text style={styles.tipSaves}>{item.saves || item.adds}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 How This Fits Your Day</Text>

          <View style={styles.fitCard}>
            <View style={styles.fitRow}>
              <Text style={styles.fitLabel}>Daily calories remaining</Text>
              <Text style={styles.fitValue}>1,490 left</Text>
            </View>
            <View style={styles.fitRow}>
              <Text style={styles.fitLabel}>Protein goal progress</Text>
              <Text style={[styles.fitValue, styles.greenText]}>52 / 180g (29%)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 24,
    paddingBottom: 0,
  },
  backButton: {
    color: '#4ADE80',
    fontSize: 16,
  },
  scroll: {
    flex: 1,
  },
  mealHeader: {
    padding: 24,
    alignItems: 'center',
  },
  matchBadge: {
    backgroundColor: '#1a2e1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  matchText: {
    color: '#4ADE80',
    fontSize: 16,
    fontWeight: '600',
  },
  mealName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  mealDescription: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  macrosCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
  },
  macrosTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 16,
  },
  calorieLabel: {
    fontSize: 18,
    color: '#fff',
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ADE80',
  },
  macroRow: {
    marginBottom: 12,
  },
  macroItem: {
    position: 'relative',
  },
  macroBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 6,
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
  macroLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  macroValue: {
    position: 'absolute',
    right: 0,
    top: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 16,
    color: '#fff',
  },
  tipSaves: {
    fontSize: 14,
    color: '#4ADE80',
  },
  fitCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
  },
  fitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fitLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  fitValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  greenText: {
    color: '#4ADE80',
  },
});
