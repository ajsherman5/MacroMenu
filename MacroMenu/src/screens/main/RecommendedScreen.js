import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';
import { calculateUserMacros, calculatePerMealMacros } from '../../utils/macroCalculator';
import { calculateMatchScore } from '../../utils/matchScore';

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
  sweetgreen: require('../../../assets/logos/sweetgreen.png'),
  qdoba: require('../../../assets/logos/qdoba.png'),
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

// All available meals across restaurants - will be scored/filtered based on user profile
const ALL_MEALS = [
  // High Protein / Bulk Options
  { id: 'bulk-1', name: 'Chicken Burrito Bowl', restaurant: 'Chipotle', brandId: 'chipotle', calories: 1050, protein: 62, carbs: 95, fat: 42, description: 'Double chicken, white rice, black beans, fajita veggies, mild salsa, cheese, sour cream', allergens: 'dairy, gluten', tags: ['chicken', 'mexican', 'bowl', 'rice', 'beans'] },
  { id: 'bulk-2', name: 'Double ShackBurger', restaurant: 'Shake Shack', brandId: 'shakeshack', calories: 930, protein: 52, carbs: 56, fat: 58, description: 'Two beef patties, cheese, lettuce, tomato, ShackSauce', allergens: 'dairy, gluten, egg', tags: ['beef', 'burger', 'cheese'] },
  { id: 'bulk-3', name: 'Big Kahuna Sub', restaurant: "Jersey Mike's", brandId: 'jerseymikes', calories: 870, protein: 48, carbs: 68, fat: 45, description: 'Ham, salami, pepperoni, provolone, lettuce, tomato, onions', allergens: 'dairy, gluten, pork', tags: ['pork', 'sub', 'sandwich', 'cheese'] },
  { id: 'bulk-4', name: 'Spicy Deluxe Sandwich', restaurant: "Chick-fil-A", brandId: 'chickfila', calories: 550, protein: 36, carbs: 48, fat: 24, description: 'Spicy chicken breast, lettuce, tomato, pepper jack cheese', allergens: 'dairy, gluten, egg', tags: ['chicken', 'spicy', 'sandwich'] },
  { id: 'bulk-5', name: 'Honey BBQ Wings (15pc)', restaurant: 'Buffalo Wild Wings', brandId: 'buffalowildwings', calories: 1140, protein: 78, carbs: 60, fat: 66, description: '15 traditional wings with Honey BBQ sauce', allergens: 'gluten', tags: ['chicken', 'wings', 'bbq'] },
  { id: 'bulk-6', name: 'Steak Burrito', restaurant: 'Chipotle', brandId: 'chipotle', calories: 1150, protein: 58, carbs: 100, fat: 48, description: 'Steak, white rice, pinto beans, cheese, sour cream, guacamole', allergens: 'dairy, gluten', tags: ['steak', 'beef', 'mexican', 'burrito'] },
  { id: 'bulk-7', name: 'Double Meat Bowl', restaurant: 'Qdoba', brandId: 'qdoba', calories: 980, protein: 65, carbs: 75, fat: 45, description: 'Double chicken, cilantro lime rice, black beans, corn salsa, cheese', allergens: 'dairy', tags: ['chicken', 'mexican', 'bowl'] },

  // Cut / Low Calorie Options
  { id: 'cut-1', name: 'Chicken Salad Bowl', restaurant: 'Chipotle', brandId: 'chipotle', calories: 480, protein: 52, carbs: 18, fat: 22, description: 'Double chicken, fajita veggies, fresh tomato salsa, lettuce', allergens: '', tags: ['chicken', 'salad', 'low-carb'] },
  { id: 'cut-2', name: 'Grilled Chicken Sandwich', restaurant: "Chick-fil-A", brandId: 'chickfila', calories: 320, protein: 30, carbs: 36, fat: 6, description: 'Grilled chicken breast, lettuce, tomato, multigrain bun', allergens: 'gluten', tags: ['chicken', 'grilled', 'sandwich'] },
  { id: 'cut-3', name: 'Greens + Grains Bowl', restaurant: 'CAVA', brandId: 'cava', calories: 520, protein: 38, carbs: 45, fat: 20, description: 'Grilled chicken, supergreens, brown rice, cucumber, tomato, lemon herb tahini', allergens: 'sesame', tags: ['chicken', 'salad', 'bowl', 'mediterranean'] },
  { id: 'cut-4', name: 'Turkey Sub (No Cheese)', restaurant: "Jersey Mike's", brandId: 'jerseymikes', calories: 380, protein: 32, carbs: 44, fat: 10, description: 'Turkey breast, lettuce, tomato, onions, oil & vinegar', allergens: 'gluten', tags: ['turkey', 'sub', 'lean'] },
  { id: 'cut-5', name: 'Grilled Nuggets (12pc)', restaurant: "Chick-fil-A", brandId: 'chickfila', calories: 200, protein: 38, carbs: 2, fat: 4, description: '12 grilled chicken nuggets', allergens: '', tags: ['chicken', 'grilled', 'low-carb'] },
  { id: 'cut-6', name: 'Protein Bowl', restaurant: 'Sweetgreen', brandId: 'sweetgreen', calories: 420, protein: 42, carbs: 28, fat: 18, description: 'Grilled chicken, warm quinoa, kale, roasted chickpeas, tahini', allergens: 'sesame', tags: ['chicken', 'salad', 'healthy'] },
  { id: 'cut-7', name: 'Naked Chicken Wings', restaurant: 'Buffalo Wild Wings', brandId: 'buffalowildwings', calories: 360, protein: 48, carbs: 0, fat: 18, description: '10 traditional wings, no sauce, no breading', allergens: '', tags: ['chicken', 'wings', 'keto', 'low-carb'] },

  // Maintain / Balanced Options
  { id: 'main-1', name: 'Chicken Bowl', restaurant: 'Chipotle', brandId: 'chipotle', calories: 680, protein: 48, carbs: 58, fat: 26, description: 'Chicken, brown rice, black beans, fajita veggies, pico de gallo', allergens: '', tags: ['chicken', 'mexican', 'bowl', 'balanced'] },
  { id: 'main-2', name: 'Original Chicken Sandwich', restaurant: "Chick-fil-A", brandId: 'chickfila', calories: 440, protein: 28, carbs: 40, fat: 18, description: 'Breaded chicken breast, pickles, butter bun', allergens: 'gluten, dairy, egg', tags: ['chicken', 'sandwich'] },
  { id: 'main-3', name: 'Classic Pita', restaurant: 'CAVA', brandId: 'cava', calories: 620, protein: 36, carbs: 55, fat: 28, description: 'Grilled chicken, hummus, tomato cucumber salad, pickled onions, pita', allergens: 'gluten, sesame', tags: ['chicken', 'mediterranean', 'pita'] },
  { id: 'main-4', name: 'ShackBurger', restaurant: 'Shake Shack', brandId: 'shakeshack', calories: 540, protein: 28, carbs: 40, fat: 32, description: 'Single beef patty, cheese, lettuce, tomato, ShackSauce', allergens: 'dairy, gluten, egg', tags: ['beef', 'burger'] },
  { id: 'main-5', name: 'Club Sub', restaurant: "Jersey Mike's", brandId: 'jerseymikes', calories: 590, protein: 34, carbs: 52, fat: 28, description: 'Turkey, ham, bacon, provolone, lettuce, tomato, mayo', allergens: 'dairy, gluten, pork, egg', tags: ['turkey', 'pork', 'sub'] },
  { id: 'main-6', name: 'Harvest Bowl', restaurant: 'Sweetgreen', brandId: 'sweetgreen', calories: 580, protein: 32, carbs: 52, fat: 28, description: 'Grilled chicken, wild rice, roasted sweet potato, kale, balsamic', allergens: '', tags: ['chicken', 'salad', 'healthy'] },

  // Vegetarian Options
  { id: 'veg-1', name: 'Veggie Bowl', restaurant: 'Chipotle', brandId: 'chipotle', calories: 580, protein: 18, carbs: 72, fat: 24, description: 'Sofritas, brown rice, black beans, fajita veggies, guacamole', allergens: 'soy', tags: ['vegetarian', 'vegan', 'mexican', 'bowl'] },
  { id: 'veg-2', name: 'Falafel Pita', restaurant: 'CAVA', brandId: 'cava', calories: 650, protein: 22, carbs: 68, fat: 32, description: 'Falafel, hummus, tahini, pickled onions, tomato, pita', allergens: 'gluten, sesame', tags: ['vegetarian', 'mediterranean', 'falafel'] },

  // Seafood Options
  { id: 'sea-1', name: 'Fish Taco Bowl', restaurant: 'Chipotle', brandId: 'chipotle', calories: 620, protein: 35, carbs: 52, fat: 28, description: 'Grilled fish, cilantro lime rice, black beans, corn salsa', allergens: 'fish', tags: ['fish', 'seafood', 'mexican'] },

  // Keto-Friendly Options
  { id: 'keto-1', name: 'Lettuce Wrap Burger', restaurant: 'Shake Shack', brandId: 'shakeshack', calories: 420, protein: 26, carbs: 8, fat: 32, description: 'ShackBurger in a lettuce wrap, no bun', allergens: 'dairy, egg', tags: ['beef', 'burger', 'keto', 'low-carb'] },
  { id: 'keto-2', name: 'Carnitas Bowl (No Rice)', restaurant: 'Chipotle', brandId: 'chipotle', calories: 520, protein: 42, carbs: 12, fat: 36, description: 'Double carnitas, fajita veggies, guacamole, cheese, lettuce', allergens: 'dairy, pork', tags: ['pork', 'keto', 'low-carb', 'mexican'] },
];

// Score and filter meals based on user profile
const getPersonalizedRecommendations = (userProfile, preferences, restrictions, targets) => {
  const allergies = restrictions?.allergies || [];
  const dietaryPreferences = restrictions?.dietaryPreferences || [];
  const foodLikes = preferences?.foodLikes || {};
  const foodDislikes = preferences?.foodDislikes || {};

  // Filter out meals with allergens
  let filteredMeals = ALL_MEALS.filter(meal => {
    const mealAllergens = (meal.allergens || '').toLowerCase();

    // Check each user allergy
    for (const allergy of allergies) {
      const allergyLower = allergy.toLowerCase();

      // Map common allergy names to ingredients
      const allergyMapping = {
        'dairy': ['dairy', 'milk', 'cheese', 'cream', 'butter'],
        'gluten': ['gluten', 'wheat', 'bread', 'bun'],
        'peanut': ['peanut', 'peanuts'],
        'tree nuts': ['almond', 'cashew', 'walnut', 'nuts'],
        'shellfish': ['shrimp', 'crab', 'lobster', 'shellfish'],
        'fish': ['fish', 'salmon', 'tuna'],
        'egg': ['egg', 'eggs'],
        'soy': ['soy', 'tofu', 'sofritas'],
        'sesame': ['sesame', 'tahini'],
      };

      const allergenKeywords = allergyMapping[allergyLower] || [allergyLower];
      for (const keyword of allergenKeywords) {
        if (mealAllergens.includes(keyword)) {
          return false; // Exclude this meal
        }
      }
    }

    // Check dietary preferences (vegetarian, vegan, etc.)
    for (const pref of dietaryPreferences) {
      const prefLower = pref.toLowerCase();
      if (prefLower === 'vegetarian' || prefLower === 'vegan') {
        // Exclude meals with meat
        const meatKeywords = ['chicken', 'beef', 'pork', 'steak', 'turkey', 'ham', 'bacon', 'fish'];
        const mealTags = (meal.tags || []).join(' ').toLowerCase();
        const mealName = meal.name.toLowerCase();
        for (const meat of meatKeywords) {
          if (mealTags.includes(meat) || mealName.includes(meat)) {
            return false;
          }
        }
      }
      if (prefLower === 'keto' || prefLower === 'low-carb') {
        // Prefer meals with low carbs
        if (meal.carbs > 30) {
          return false;
        }
      }
    }

    return true;
  });

  // Calculate match scores using the real algorithm
  const scoredMeals = filteredMeals.map(meal => {
    const matchResult = calculateMatchScore(meal, targets, { foodLikes, foodDislikes, allergies });
    return {
      ...meal,
      matchScore: matchResult.score,
      matchRating: matchResult.rating,
      matchBreakdown: matchResult.breakdown,
      matchReasons: matchResult.reasons,
      matchInfo: matchResult.matchInfo,
    };
  });

  // Sort by match score
  scoredMeals.sort((a, b) => b.matchScore - a.matchScore);

  // Categorize into tiers (more generous thresholds)
  const topPicks = scoredMeals.filter(m => m.matchScore >= 85);
  const greatOptions = scoredMeals.filter(m => m.matchScore >= 70 && m.matchScore < 85);
  const otherOptions = scoredMeals.filter(m => m.matchScore >= 50 && m.matchScore < 70);

  return {
    topPicks,
    greatOptions,
    otherOptions,
    all: scoredMeals,
  };
};

// MealCard Component
const MealCard = ({ meal, rank, onPress, whyLabel, tier }) => {
  const logo = getRestaurantLogo(meal.restaurant);

  return (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.mealHeader}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
        <View style={[styles.matchBadge, { backgroundColor: getMatchBg(meal.matchScore) }]}>
          <Text style={[styles.matchText, { color: getMatchColor(meal.matchScore) }]}>
            {meal.matchScore}% match
          </Text>
        </View>
      </View>

      <View style={styles.mealRow}>
        <View style={styles.restaurantIcon}>
          {logo ? (
            <Image source={logo} style={styles.restaurantLogo} resizeMode="contain" />
          ) : (
            <Ionicons name="restaurant-outline" size={20} color="#666" />
          )}
        </View>
        <View style={styles.mealContent}>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.restaurantName}>{meal.restaurant}</Text>
        </View>
      </View>

      {/* Why Label - contextual reason */}
      {whyLabel && tier === 'other' && (
        <View style={styles.whyLabelOther}>
          <Ionicons name="information-circle-outline" size={14} color="#999" />
          <Text style={styles.whyLabelTextOther}>{whyLabel}</Text>
        </View>
      )}

      {/* Positive highlight for top picks */}
      {whyLabel && tier === 'top' && (
        <View style={styles.whyLabelTop}>
          <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
          <Text style={styles.whyLabelTextTop}>{whyLabel}</Text>
        </View>
      )}

      {/* Positive highlight for great options */}
      {whyLabel && tier === 'great' && (
        <View style={styles.whyLabelGreat}>
          <Ionicons name="checkmark-circle" size={14} color="#3B82F6" />
          <Text style={styles.whyLabelTextGreat}>{whyLabel}</Text>
        </View>
      )}

      <View style={styles.macrosRow}>
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{meal.calories}</Text>
          <Text style={styles.macroLabel}>cal</Text>
        </View>
        <View style={styles.macroDivider} />
        <View style={styles.macroItem}>
          <Text style={[styles.macroValue, styles.proteinText]}>{meal.protein}g</Text>
          <Text style={styles.macroLabel}>protein</Text>
        </View>
        <View style={styles.macroDivider} />
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{meal.carbs}g</Text>
          <Text style={styles.macroLabel}>carbs</Text>
        </View>
        <View style={styles.macroDivider} />
        <View style={styles.macroItem}>
          <Text style={styles.macroValue}>{meal.fat}g</Text>
          <Text style={styles.macroLabel}>fat</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function RecommendedScreen({ navigation }) {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState({
    topPicks: [],
    greatOptions: [],
    otherOptions: [],
    all: [],
  });
  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'highProtein', label: 'High Protein' },
    { id: 'lowCal', label: 'Low Cal' },
    { id: 'quickEats', label: 'Quick Eats' },
  ];

  useEffect(() => {
    loadRecommendations();
  }, [user.profile?.goal, user.preferences, user.restrictions]);

  const loadRecommendations = () => {
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      const targets = getUserTargets();
      const recommended = getPersonalizedRecommendations(
        user.profile,
        user.preferences,
        user.restrictions,
        targets
      );
      setRecommendations(recommended);
      setLoading(false);
    }, 500);
  };

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

  const handleMealPress = (meal) => {
    const restaurant = {
      id: meal.brandId,
      name: meal.restaurant,
      brandId: meal.brandId,
    };

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
        return 'balanced';
    }
  };

  const getPersonalizationSummary = () => {
    const parts = [];

    // Goal
    parts.push(getGoalText());

    // Dietary preferences
    const dietaryPrefs = user.restrictions?.dietaryPreferences || [];
    if (dietaryPrefs.length > 0) {
      parts.push(dietaryPrefs[0].toLowerCase());
    }

    return parts.join(', ');
  };

  const hasRestrictions = () => {
    const allergies = user.restrictions?.allergies || [];
    const dietary = user.restrictions?.dietaryPreferences || [];
    return allergies.length > 0 || dietary.length > 0;
  };

  const applyFilter = (meals) => {
    switch (activeFilter) {
      case 'highProtein':
        return meals.filter(m => m.protein >= 40);
      case 'lowCal':
        return meals.filter(m => m.calories <= 600);
      case 'quickEats':
        return meals.slice(0, 3);
      default:
        return meals;
    }
  };

  const filteredTopPicks = applyFilter(recommendations.topPicks);
  const filteredGreatOptions = applyFilter(recommendations.greatOptions);
  const filteredOtherOptions = applyFilter(recommendations.otherOptions);

  // Generate contextual "why" label for a meal
  // For top picks and great options: focus on positives
  // For other options: show why it's lower
  const getWhyLabel = (meal, tier) => {
    const reasons = meal.matchReasons || { positive: [], negative: [] };
    const matchInfo = meal.matchInfo || {};

    // For "Other Options" - show why it's not ideal
    if (tier === 'other') {
      if (matchInfo.matchedDislikes && matchInfo.matchedDislikes.length > 0) {
        return `Contains ${matchInfo.matchedDislikes[0]} (not your usual)`;
      }
      if (reasons.negative.length > 0) {
        return reasons.negative[0];
      }
    }

    // For Top Picks and Great Options - focus on the positives
    if (reasons.positive.length > 0) {
      return reasons.positive[0];
    }

    // Fallback: generate a positive based on macros
    if (meal.protein >= 40) {
      return `${meal.protein}g protein`;
    }
    if (meal.calories <= 500) {
      return `Only ${meal.calories} calories`;
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>For You</Text>
          <Text style={styles.subtitle}>
            Personalized for your {getPersonalizationSummary()} goals
          </Text>
          {hasRestrictions() && (
            <View style={styles.restrictionBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#22C55E" />
              <Text style={styles.restrictionText}>Filtered for your dietary needs</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.refreshButton} onPress={loadRecommendations}>
          <Ionicons name="refresh-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.filterChip,
              activeFilter === filter.id && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter.id)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter.id && styles.filterTextActive,
              ]}
            >
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Finding perfect meals for you...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Top Picks Section */}
          {filteredTopPicks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="star" size={18} color="#22C55E" />
                  <Text style={styles.sectionTitle}>Top Picks For You</Text>
                </View>
                <Text style={styles.sectionSubtitle}>Best matches for your goals</Text>
              </View>
              {filteredTopPicks.map((meal, index) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  rank={index + 1}
                  onPress={() => handleMealPress(meal)}
                  whyLabel={getWhyLabel(meal, 'top')}
                  tier="top"
                />
              ))}
            </View>
          )}

          {/* Great Options Section */}
          {filteredGreatOptions.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="thumbs-up" size={18} color="#3B82F6" />
                  <Text style={styles.sectionTitle}>Great Options</Text>
                </View>
                <Text style={styles.sectionSubtitle}>Solid choices that fit your macros</Text>
              </View>
              {filteredGreatOptions.map((meal, index) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  rank={filteredTopPicks.length + index + 1}
                  onPress={() => handleMealPress(meal)}
                  whyLabel={getWhyLabel(meal, 'great')}
                  tier="great"
                />
              ))}
            </View>
          )}

          {/* Other Options (Collapsible) */}
          {filteredOtherOptions.length > 0 && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={() => setShowOtherOptions(!showOtherOptions)}
                activeOpacity={0.7}
              >
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="list-outline" size={18} color="#999" />
                  <Text style={styles.otherOptionsTitle}>Other Options</Text>
                  <Text style={styles.otherOptionsCount}>({filteredOtherOptions.length})</Text>
                </View>
                <Ionicons
                  name={showOtherOptions ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
              {showOtherOptions && (
                <View style={styles.collapsibleContent}>
                  {filteredOtherOptions.map((meal, index) => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      rank={filteredTopPicks.length + filteredGreatOptions.length + index + 1}
                      onPress={() => handleMealPress(meal)}
                      whyLabel={getWhyLabel(meal, 'other')}
                      tier="other"
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Empty State */}
          {filteredTopPicks.length === 0 && filteredGreatOptions.length === 0 && filteredOtherOptions.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="restaurant-outline" size={48} color="#999" />
              </View>
              <Text style={styles.emptyTitle}>No meals found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different filter
              </Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      )}
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  restrictionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  restrictionText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
    marginLeft: 6,
  },
  refreshButton: {
    width: 44,
    height: 44,
    backgroundColor: '#fff',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  filterScroll: {
    maxHeight: 50,
    marginTop: 8,
  },
  filterRow: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  filterChipActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  mealCard: {
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
  mealHeader: {
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
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  restaurantLogo: {
    width: 26,
    height: 26,
  },
  mealContent: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  restaurantName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  mealDescription: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
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
  // Section styles
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    marginLeft: 26,
  },
  // Collapsible header
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  otherOptionsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginLeft: 8,
  },
  otherOptionsCount: {
    fontSize: 14,
    color: '#999',
    marginLeft: 6,
  },
  collapsibleContent: {
    marginTop: 4,
  },
  // Why label styles
  whyLabelOther: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  whyLabelTextOther: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  whyLabelTop: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  whyLabelTextTop: {
    fontSize: 12,
    color: '#166534',
    marginLeft: 6,
    flex: 1,
  },
  whyLabelGreat: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  whyLabelTextGreat: {
    fontSize: 12,
    color: '#1E40AF',
    marginLeft: 6,
    flex: 1,
  },
});
