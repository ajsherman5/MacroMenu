import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';
import { searchMenuItems } from '../../services/api/nutritionix';
import { rankMeals } from '../../utils/matchScore';
import { calculateUserMacros, calculatePerMealMacros } from '../../utils/macroCalculator';

// Restaurant logos
const logos = {
  chipotle: require('../../../assets/logos/chipotle.png'),
  shakeshack: require('../../../assets/logos/shakeshack.png'),
  jerseymikes: require('../../../assets/logos/jerseysmikes.png'),
  whataburger: require('../../../assets/logos/whataburger.png'),
  buffalowildwings: require('../../../assets/logos/buffalowildwings.png'),
  sonic: require('../../../assets/logos/sonic.png'),
  chickfila: require('../../../assets/logos/chickfila.png'),
  cava: require('../../../assets/logos/Cava-Logo.png'),
};

function getRestaurantLogo(name) {
  const normalized = name.toLowerCase().replace(/[^a-z]/g, '');
  return logos[normalized] || null;
}

function getMatchColor(score) {
  if (score >= 85) return '#22C55E';
  if (score >= 70) return '#F59E0B';
  return '#EF4444';
}

function getMatchBg(score) {
  if (score >= 85) return '#DCFCE7';
  if (score >= 70) return '#FEF3C7';
  return '#FEE2E2';
}

export default function RestaurantDetailScreen({ navigation, route }) {
  const { user } = useUser();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const restaurant = route?.params?.restaurant || { name: 'Restaurant', type: 'Restaurant' };
  const logo = getRestaurantLogo(restaurant.name);

  const getUserTargets = () => {
    if (user.macros?.calories) {
      return calculatePerMealMacros(user.macros);
    }

    if (user.profile?.currentWeight && user.profile?.height && user.profile?.goal) {
      const calculated = calculateUserMacros(user.profile);
      return calculated.perMeal;
    }

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
      const items = await searchMenuItems(restaurant.name);

      if (items.length === 0) {
        setError('No menu items found. Try searching for a specific item.');
        setMenuItems([]);
        return;
      }

      const targets = getUserTargets();
      const preferences = {
        foodLikes: user.preferences?.foodLikes || {},
        foodDislikes: user.preferences?.foodDislikes || {},
        allergies: user.restrictions?.allergies || [],
      };

      const rankedItems = rankMeals(items, targets, preferences, 0);
      setMenuItems(rankedItems.slice(0, 20));
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

  const getGoalText = () => {
    switch (user.profile?.goal) {
      case 'bulk':
        return 'muscle-building';
      case 'cut':
        return 'fat-loss';
      default:
        return 'fitness';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Restaurant Header */}
        <View style={styles.restaurantHeader}>
          <View style={styles.logoContainer}>
            {logo ? (
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            ) : (
              <Ionicons name="restaurant-outline" size={48} color="#666" />
            )}
          </View>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          <Text style={styles.restaurantType}>{restaurant.type}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#000" />
            <Text style={styles.loadingText}>Finding the best meals for you...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorIcon}>
              <Ionicons name="alert-circle-outline" size={48} color="#F59E0B" />
            </View>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadMenuItems}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Best For You</Text>
            <Text style={styles.sectionSubtitle}>
              Ranked by your {getGoalText()} goals
            </Text>

            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.id || index}
                style={styles.menuCard}
                onPress={() => handleMealPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.menuHeader}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>
                  <View style={[styles.matchBadge, { backgroundColor: getMatchBg(item.matchScore) }]}>
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
                  <View style={styles.macroDivider} />
                  <View style={styles.macroItem}>
                    <Text style={[styles.macroValue, styles.proteinText]}>{item.protein}g</Text>
                    <Text style={styles.macroLabel}>protein</Text>
                  </View>
                  <View style={styles.macroDivider} />
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{item.carbs}g</Text>
                    <Text style={styles.macroLabel}>carbs</Text>
                  </View>
                  <View style={styles.macroDivider} />
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{item.fat}g</Text>
                    <Text style={styles.macroLabel}>fat</Text>
                  </View>
                </View>

                {/* Match breakdown hints */}
                {item.matchBreakdown && (
                  <View style={styles.breakdownHint}>
                    {item.matchBreakdown.protein >= 85 && (
                      <View style={styles.hintBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                        <Text style={styles.hintText}>Great protein</Text>
                      </View>
                    )}
                    {item.matchBreakdown.calories >= 85 && (
                      <View style={styles.hintBadge}>
                        <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                        <Text style={styles.hintText}>Perfect calories</Text>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {menuItems.length === 0 && !loading && !error && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="restaurant-outline" size={48} color="#999" />
                </View>
                <Text style={styles.emptyTitle}>No meals found</Text>
                <Text style={styles.emptySubtitle}>
                  We couldn't find menu items for this restaurant
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  restaurantHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  logo: {
    width: 64,
    height: 64,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  restaurantType: {
    fontSize: 16,
    color: '#666',
  },
  loadingContainer: {
    padding: 48,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 48,
    alignItems: 'center',
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankBadge: {
    backgroundColor: '#000',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '600',
  },
  menuName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 12,
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E5E5',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  proteinText: {
    color: '#000',
  },
  macroLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  breakdownHint: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  hintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hintText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
