import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const menuItems = [
  {
    id: '1',
    name: 'Chicken Burrito Bowl',
    match: 95,
    calories: 660,
    protein: 52,
    carbs: 54,
    fat: 18,
    description: 'Chicken, rice, black beans, fajita veggies, salsa'
  },
  {
    id: '2',
    name: 'Steak Salad',
    match: 88,
    calories: 520,
    protein: 42,
    carbs: 18,
    fat: 28,
    description: 'Steak, romaine, cheese, guac, salsa'
  },
  {
    id: '3',
    name: 'Carnitas Tacos (3)',
    match: 82,
    calories: 580,
    protein: 38,
    carbs: 48,
    fat: 22,
    description: 'Carnitas, cheese, lettuce, salsa'
  },
  {
    id: '4',
    name: 'Veggie Bowl',
    match: 75,
    calories: 480,
    protein: 14,
    carbs: 72,
    fat: 18,
    description: 'Sofritas, rice, beans, veggies, guac'
  },
];

export default function RestaurantDetailScreen({ navigation, route }) {
  const restaurant = route?.params?.restaurant || { name: 'Chipotle', icon: '🌯', type: 'Mexican' };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantIcon}>{restaurant.icon}</Text>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantType}>{restaurant.type}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Best For You</Text>
          <Text style={styles.sectionSubtitle}>Ranked by your goals</Text>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => navigation.navigate('MealDetail', { meal: item })}
            >
              <View style={styles.menuHeader}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>{item.match}% match</Text>
                </View>
              </View>

              <Text style={styles.menuName}>{item.name}</Text>
              <Text style={styles.menuDescription}>{item.description}</Text>

              <View style={styles.macrosRow}>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{item.calories}</Text>
                  <Text style={styles.macroLabel}>cal</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={[styles.macroValue, styles.proteinText]}>{item.protein}g</Text>
                  <Text style={styles.macroLabel}>protein</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{item.carbs}g</Text>
                  <Text style={styles.macroLabel}>carbs</Text>
                </View>
                <View style={styles.macroItem}>
                  <Text style={styles.macroValue}>{item.fat}g</Text>
                  <Text style={styles.macroLabel}>fat</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  restaurantHeader: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 16,
  },
  restaurantIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  restaurantType: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  section: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 16,
  },
  menuCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rankBadge: {
    backgroundColor: '#4ADE80',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchBadge: {
    backgroundColor: '#1a2e1a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchText: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '600',
  },
  menuName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#171717',
    borderRadius: 8,
    padding: 12,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  proteinText: {
    color: '#4ADE80',
  },
  macroLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
