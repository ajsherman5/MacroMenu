import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../context/UserContext';
import { calculateDailyFit } from '../../utils/matchScore';
import { calculateUserMacros, calculatePerMealMacros } from '../../utils/macroCalculator';
import { openDoorDash, openUberEats, openMaps, copyOrderToClipboard, getOrderingOptions } from '../../services/deepLink';

function getMatchColor(score) {
  if (score >= 85) return '#4ADE80';
  if (score >= 70) return '#F59E0B';
  return '#EF4444';
}

export default function MealDetailScreen({ navigation, route }) {
  const { user } = useUser();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderingOptions, setOrderingOptions] = useState([]);

  const meal = route?.params?.meal || {
    name: 'Menu Item',
    matchScore: 80,
    calories: 500,
    protein: 30,
    carbs: 40,
    fat: 20,
  };
  const restaurant = route?.params?.restaurant || { name: 'Restaurant' };
  const userTargets = route?.params?.userTargets;

  // Get user's daily macros for "how this fits your day"
  const getDailyMacros = () => {
    if (user.macros?.calories) {
      return user.macros;
    }

    if (user.profile?.currentWeight && user.profile?.height && user.profile?.goal) {
      const calculated = calculateUserMacros(user.profile);
      return calculated.daily;
    }

    return {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 70,
    };
  };

  const dailyMacros = getDailyMacros();
  const dailyFit = calculateDailyFit(meal, dailyMacros);

  // Generate healthify tips based on meal composition and user goal
  const getHealthifyTips = () => {
    const tips = [];
    const goal = user.profile?.goal;

    if (goal === 'cut') {
      // Cutting tips - reduce calories
      if (meal.carbs > 50) {
        tips.push({ tip: 'Ask for no rice/bread', saves: `-${Math.round(meal.carbs * 0.4 * 4)} cal` });
      }
      if (meal.fat > 20) {
        tips.push({ tip: 'Request light/no sauce', saves: `-${Math.round(meal.fat * 0.3 * 9)} cal` });
      }
      if (meal.calories > 600) {
        tips.push({ tip: 'Order half portion', saves: `-${Math.round(meal.calories * 0.5)} cal` });
      }
    } else if (goal === 'bulk') {
      // Bulking tips - add protein/calories
      tips.push({ tip: 'Add double protein', adds: `+25-35g protein` });
      if (meal.carbs < 60) {
        tips.push({ tip: 'Add extra rice/bread', adds: `+150-200 cal` });
      }
      tips.push({ tip: 'Add avocado/guac', adds: `+150 cal, healthy fats` });
    } else {
      // Maintenance tips - balance
      if (meal.protein < 25) {
        tips.push({ tip: 'Add grilled chicken', adds: `+25g protein` });
      }
      if (meal.fat > 30) {
        tips.push({ tip: 'Dressing on the side', saves: `-100 cal` });
      }
    }

    // Always include these general tips if relevant
    if (meal.protein < (userTargets?.protein || 40)) {
      tips.push({ tip: 'Add a side of eggs', adds: `+12g protein` });
    }

    return tips.slice(0, 3); // Max 3 tips
  };

  const healthifyTips = getHealthifyTips();

  const handleOrderPress = async () => {
    const options = await getOrderingOptions(restaurant.name);
    setOrderingOptions(options);
    setShowOrderModal(true);
  };

  const handleOrderOption = async (optionId) => {
    setShowOrderModal(false);

    try {
      switch (optionId) {
        case 'doordash':
          await openDoorDash(restaurant.name);
          break;
        case 'ubereats':
          await openUberEats(restaurant.name);
          break;
        case 'maps':
          await openMaps(restaurant.name);
          break;
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to open app. Please try again.');
    }
  };

  const handleCopyOrder = async () => {
    const items = [{
      name: meal.name,
      customizations: healthifyTips.map((t) => t.tip),
    }];

    const success = await copyOrderToClipboard(items);
    if (success) {
      Alert.alert('Copied!', 'Order details copied to clipboard. Paste in the ordering app.');
    } else {
      Alert.alert('Error', 'Unable to copy to clipboard.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.mealHeader}>
          <View style={[styles.matchBadge, { backgroundColor: `${getMatchColor(meal.matchScore || 80)}20` }]}>
            <Text style={[styles.matchText, { color: getMatchColor(meal.matchScore || 80) }]}>
              {meal.matchScore || 80}% match
            </Text>
          </View>
          <Text style={styles.mealName}>{meal.name}</Text>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>
          {meal.description && (
            <Text style={styles.mealDescription}>{meal.description}</Text>
          )}
        </View>

        <View style={styles.macrosCard}>
          <Text style={styles.macrosTitle}>Nutrition Facts</Text>

          <View style={styles.calorieRow}>
            <Text style={styles.calorieLabel}>Calories</Text>
            <Text style={styles.calorieValue}>{meal.calories}</Text>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, styles.proteinBar, { width: `${Math.min((meal.protein / 60) * 100, 100)}%` }]} />
              <Text style={styles.macroLabel}>Protein</Text>
              <Text style={styles.macroValue}>{meal.protein}g</Text>
            </View>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, styles.carbsBar, { width: `${Math.min((meal.carbs / 100) * 100, 100)}%` }]} />
              <Text style={styles.macroLabel}>Carbs</Text>
              <Text style={styles.macroValue}>{meal.carbs}g</Text>
            </View>
          </View>

          <View style={styles.macroRow}>
            <View style={styles.macroItem}>
              <View style={[styles.macroBar, styles.fatBar, { width: `${Math.min((meal.fat / 40) * 100, 100)}%` }]} />
              <Text style={styles.macroLabel}>Fat</Text>
              <Text style={styles.macroValue}>{meal.fat}g</Text>
            </View>
          </View>
        </View>

        {healthifyTips.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {user.profile?.goal === 'bulk' ? '💪 Bulk It Up' : user.profile?.goal === 'cut' ? '🔥 Lean It Out' : '💡 Healthify Tips'}
            </Text>
            <Text style={styles.sectionSubtitle}>Modifications to fit your goals better</Text>

            {healthifyTips.map((item, index) => (
              <View key={index} style={styles.tipCard}>
                <Text style={styles.tipText}>{item.tip}</Text>
                <Text style={[styles.tipSaves, item.adds && styles.tipAdds]}>
                  {item.saves || item.adds}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 How This Fits Your Day</Text>

          <View style={styles.fitCard}>
            <View style={styles.fitRow}>
              <Text style={styles.fitLabel}>This meal</Text>
              <Text style={styles.fitValue}>{meal.calories} cal</Text>
            </View>
            <View style={styles.fitRow}>
              <Text style={styles.fitLabel}>Your daily target</Text>
              <Text style={styles.fitValue}>{dailyMacros.calories} cal</Text>
            </View>
            <View style={styles.fitDivider} />
            <View style={styles.fitRow}>
              <Text style={styles.fitLabel}>Remaining after this meal</Text>
              <Text style={[styles.fitValue, dailyFit.isOverCalories ? styles.redText : styles.greenText]}>
                {dailyFit.remaining.calories} cal
              </Text>
            </View>
            <View style={styles.fitRow}>
              <Text style={styles.fitLabel}>Protein progress</Text>
              <Text style={[styles.fitValue, styles.greenText]}>
                {meal.protein} / {dailyMacros.protein}g ({dailyFit.percentOfDaily.protein}%)
              </Text>
            </View>
          </View>
        </View>

        {/* Order Button */}
        <View style={styles.orderSection}>
          <TouchableOpacity style={styles.orderButton} onPress={handleOrderPress}>
            <Text style={styles.orderButtonText}>Order This Meal</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.copyButton} onPress={handleCopyOrder}>
            <Text style={styles.copyButtonText}>📋 Copy Order Details</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Order Options Modal */}
      <Modal
        visible={showOrderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Order from {restaurant.name}</Text>
            <Text style={styles.modalSubtitle}>Choose how you'd like to order</Text>

            {orderingOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.modalOption}
                onPress={() => handleOrderOption(option.id)}
              >
                <Text style={styles.modalOptionIcon}>
                  {option.id === 'doordash' ? '🚗' : option.id === 'ubereats' ? '🛵' : '📍'}
                </Text>
                <View style={styles.modalOptionContent}>
                  <Text style={styles.modalOptionTitle}>{option.name}</Text>
                  <Text style={styles.modalOptionSubtitle}>
                    {option.appInstalled ? 'Open app' : 'Open in browser'}
                  </Text>
                </View>
                <Text style={styles.modalOptionArrow}>→</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowOrderModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  matchText: {
    fontSize: 16,
    fontWeight: '600',
  },
  mealName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 16,
    color: '#4ADE80',
    marginBottom: 8,
  },
  mealDescription: {
    fontSize: 14,
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
    flex: 1,
  },
  tipSaves: {
    fontSize: 14,
    color: '#4ADE80',
  },
  tipAdds: {
    color: '#F59E0B',
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
  fitDivider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 8,
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
  redText: {
    color: '#EF4444',
  },
  orderSection: {
    paddingHorizontal: 24,
    gap: 12,
  },
  orderButton: {
    backgroundColor: '#4ADE80',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  copyButton: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1F1F1F',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalOptionIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalOptionSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  modalOptionArrow: {
    fontSize: 18,
    color: '#9CA3AF',
  },
  modalCancel: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
