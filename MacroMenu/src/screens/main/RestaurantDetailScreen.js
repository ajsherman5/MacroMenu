import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../context/UserContext';
import { searchMenuItems } from '../../services/api/nutritionix';
import { rankMeals, calculateMatchScore } from '../../utils/matchScore';
import { calculateUserMacros, calculatePerMealMacros } from '../../utils/macroCalculator';

// Restaurant icons mapping
const RESTAURANT_ICONS = {
  chipotle: '🌯',
  mcdonalds: '🍔',
  subway: '🥪',
  'chick-fil-a': '🍗',
  chickfila: '🍗',
  wendys: '🍔',
  'taco bell': '🌮',
  tacobell: '🌮',
  panera: '🥖',
  'panera bread': '🥖',
  starbucks: '☕',
  sweetgreen: '🥗',
  'shake shack': '🍔',
  shakeshack: '🍔',
  'buffalo wild wings': '🍗',
  cava: '🥙',
  'jersey mikes': '🥪',
  whataburger: '🍔',
  sonic: '🍔',
  default: '🍽️',
};

function getRestaurantIcon(name) {
  const normalized = name.toLowerCase().replace(/[^a-z ]/g, '');
  return RESTAURANT_ICONS[normalized] || RESTAURANT_ICONS.default;
}

function getMatchColor(score) {
  if (score >= 85) return '#4ADE80'; // Green
  if (score >= 70) return '#F59E0B'; // Yellow/Orange
  return '#EF4444'; // Red
}

export default function RestaurantDetailScreen({ navigation, route }) {
  const { user } = useUser();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const restaurant = route?.params?.restaurant || { name: 'Restaurant', type: 'Restaurant' };

  // Calculate user's per-meal macro targets
  const getUserTargets = () => {
    // If user has set macros, use those
    if (user.macros?.calories) {
      return calculatePerMealMacros(user.macros);
    }

    // Otherwise calculate from profile
    if (user.profile?.currentWeight && user.profile?.height && user.profile?.goal) {
      const calculated = calculateUserMacros(user.profile);
      return calculated.perMeal;
    }

    // Default targets for a general user
    return {
      calories: 700,
      protein: 40,
      carbs: 80,
      fat: 25,
    };
  };

  useEffect(() => {
    loadMenuItems();
  }, [restaurant]);

  const loadMenuItems = async () => {
    setLoading(true);
    setError(null);

    try {
      // Search for menu items from this restaurant
      const items = await searchMenuItems(restaurant.name);

      if (items.length === 0) {
        setError('No menu items found. Try searching for a specific item.');
        setMenuItems([]);
        return;
      }

      // Get user targets and preferences
      const targets = getUserTargets();
      const preferences = {
        foodLikes: user.preferences?.foodLikes || {},
        foodDislikes: user.preferences?.foodDislikes || {},
        allergies: user.restrictions?.allergies || [],
      };

      // Calculate match scores and rank meals
      const rankedItems = rankMeals(items, targets, preferences, 0); // No minimum score filter

      setMenuItems(rankedItems.slice(0, 20)); // Show top 20
    } catch (err) {
      console.error('Error loading menu items:', err);
      setError('Unable to load menu. Please try again.');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMealPress = (meal) => {
    navigation.navigate('MealDetail', {
      meal,
      restaurant,
      userTargets: getUserTargets(),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.restaurantHeader}>
          <Text style={styles.restaurantIcon}>{getRestaurantIcon(restaurant.name)}</Text>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantType}>{restaurant.type}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ADE80" />
            <Text style={styles.loadingText}>Finding the best meals for you...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadMenuItems}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Best For You</Text>
            <Text style={styles.sectionSubtitle}>
              Ranked by your {user.profile?.goal === 'bulk' ? 'muscle-building' : user.profile?.goal === 'cut' ? 'fat-loss' : 'fitness'} goals
            </Text>

            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id || index}
                style={styles.menuCard}
                onPress={() => handleMealPress(item)}
              >
                <View style={styles.menuHeader}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <View style={[styles.matchBadge, { backgroundColor: `${getMatchColor(item.matchScore)}20` }]}>
                    <Text style={[styles.matchText, { color: getMatchColor(item.matchScore) }]}>
                      {item.matchScore}% match
                    </Text>
                  </View>
                </View>

                <Text style={styles.menuName}>{item.name}</Text>
                {item.description && (
                  <Text style={styles.menuDescription} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}

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

                {/* Match breakdown hint */}
                {item.matchBreakdown && (
                  <View style={styles.breakdownHint}>
                    {item.matchBreakdown.protein >= 85 && (
                      <Text style={styles.hintText}>✓ Great protein</Text>
                    )}
                    {item.matchBreakdown.calories >= 85 && (
                      <Text style={styles.hintText}>✓ Perfect calories</Text>
                    )}
                    {item.matchBreakdown.macroBalance >= 80 && (
                      <Text style={styles.hintText}>✓ Balanced macros</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {menuItems.length === 0 && !loading && !error && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>🍽️</Text>
                <Text style={styles.emptyTitle}>No meals found</Text>
                <Text style={styles.emptySubtitle}>
                  We couldn't find menu items for this restaurant
                </Text>
              </View>
            )}
          </View>
        )}
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
    textAlign: 'center',
  },
  restaurantType: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 48,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4ADE80',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#000',
    fontWeight: '600',
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  matchText: {
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
  breakdownHint: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  hintText: {
    fontSize: 12,
    color: '#4ADE80',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
