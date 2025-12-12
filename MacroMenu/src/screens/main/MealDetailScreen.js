import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';
import { calculateDailyFit } from '../../utils/matchScore';
import { calculateUserMacros } from '../../utils/macroCalculator';
import { openDoorDash, openUberEats, openMaps, copyOrderToClipboard, getOrderingOptions } from '../../services/deepLink';

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

export default function MealDetailScreen({ navigation, route }) {
  const { user } = useUser();
  const insets = useSafeAreaInsets();
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

  const getHealthifyTips = () => {
    const tips = [];
    const goal = user.profile?.goal;

    if (goal === 'cut') {
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
      tips.push({ tip: 'Add double protein', adds: `+25-35g protein` });
      if (meal.carbs < 60) {
        tips.push({ tip: 'Add extra rice/bread', adds: `+150-200 cal` });
      }
      tips.push({ tip: 'Add avocado/guac', adds: `+150 cal, healthy fats` });
    } else {
      if (meal.protein < 25) {
        tips.push({ tip: 'Add grilled chicken', adds: `+25g protein` });
      }
      if (meal.fat > 30) {
        tips.push({ tip: 'Dressing on the side', saves: `-100 cal` });
      }
    }

    if (meal.protein < (userTargets?.protein || 40)) {
      tips.push({ tip: 'Add a side of eggs', adds: `+12g protein` });
    }

    return tips.slice(0, 3);
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

  const getTipsTitle = () => {
    switch (user.profile?.goal) {
      case 'bulk':
        return 'Bulk It Up';
      case 'cut':
        return 'Lean It Out';
      default:
        return 'Healthify Tips';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Meal Header */}
        <View style={styles.mealHeader}>
          <View style={[styles.matchBadge, { backgroundColor: getMatchBg(meal.matchScore || 80) }]}>
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

        {/* Nutrition Card */}
        <View style={styles.nutritionCard}>
          <Text style={styles.cardTitle}>Nutrition Facts</Text>

          <View style={styles.calorieRow}>
            <Text style={styles.calorieLabel}>Calories</Text>
            <Text style={styles.calorieValue}>{meal.calories}</Text>
          </View>

          <View style={styles.macroBarRow}>
            <View style={styles.macroBarItem}>
              <View style={styles.macroBarHeader}>
                <Text style={styles.macroBarLabel}>Protein</Text>
                <Text style={styles.macroBarValue}>{meal.protein}g</Text>
              </View>
              <View style={styles.macroBarBg}>
                <View style={[styles.macroBar, styles.proteinBar, { width: `${Math.min((meal.protein / 60) * 100, 100)}%` }]} />
              </View>
            </View>
          </View>

          <View style={styles.macroBarRow}>
            <View style={styles.macroBarItem}>
              <View style={styles.macroBarHeader}>
                <Text style={styles.macroBarLabel}>Carbs</Text>
                <Text style={styles.macroBarValue}>{meal.carbs}g</Text>
              </View>
              <View style={styles.macroBarBg}>
                <View style={[styles.macroBar, styles.carbsBar, { width: `${Math.min((meal.carbs / 100) * 100, 100)}%` }]} />
              </View>
            </View>
          </View>

          <View style={styles.macroBarRow}>
            <View style={styles.macroBarItem}>
              <View style={styles.macroBarHeader}>
                <Text style={styles.macroBarLabel}>Fat</Text>
                <Text style={styles.macroBarValue}>{meal.fat}g</Text>
              </View>
              <View style={styles.macroBarBg}>
                <View style={[styles.macroBar, styles.fatBar, { width: `${Math.min((meal.fat / 40) * 100, 100)}%` }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Healthify Tips */}
        {healthifyTips.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={20} color="#000" />
              <Text style={styles.sectionTitle}>{getTipsTitle()}</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Modifications to fit your goals better</Text>

            {healthifyTips.map((item, index) => (
              <View key={index} style={styles.tipCard}>
                <Text style={styles.tipText}>{item.tip}</Text>
                <Text style={[styles.tipChange, item.adds && styles.tipAdds]}>
                  {item.saves || item.adds}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Daily Fit */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="pie-chart-outline" size={20} color="#000" />
            <Text style={styles.sectionTitle}>How This Fits Your Day</Text>
          </View>

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

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={[styles.bottomButtons, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.orderButton} onPress={handleOrderPress}>
          <Text style={styles.orderButtonText}>Order This Meal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.copyButton} onPress={handleCopyOrder}>
          <Ionicons name="clipboard-outline" size={18} color="#000" />
          <Text style={styles.copyButtonText}>Copy Order Details</Text>
        </TouchableOpacity>
      </View>

      {/* Order Options Modal */}
      <Modal
        visible={showOrderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOrderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Order from {restaurant.name}</Text>
            <Text style={styles.modalSubtitle}>Choose how you'd like to order</Text>

            {orderingOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.modalOption}
                onPress={() => handleOrderOption(option.id)}
              >
                <View style={styles.modalOptionIcon}>
                  <Ionicons
                    name={option.id === 'doordash' ? 'car-outline' : option.id === 'ubereats' ? 'bicycle-outline' : 'location-outline'}
                    size={24}
                    color="#000"
                  />
                </View>
                <View style={styles.modalOptionContent}>
                  <Text style={styles.modalOptionTitle}>{option.name}</Text>
                  <Text style={styles.modalOptionSubtitle}>
                    {option.appInstalled ? 'Open app' : 'Open in browser'}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
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
  mealHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  matchBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  matchText: {
    fontSize: 15,
    fontWeight: '600',
  },
  mealName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  mealDescription: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  nutritionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 16,
  },
  calorieLabel: {
    fontSize: 18,
    color: '#000',
  },
  calorieValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  macroBarRow: {
    marginBottom: 12,
  },
  macroBarItem: {},
  macroBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  macroBarLabel: {
    fontSize: 14,
    color: '#666',
  },
  macroBarValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  macroBarBg: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  macroBar: {
    height: 8,
    borderRadius: 4,
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
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tipText: {
    fontSize: 16,
    color: '#000',
    flex: 1,
  },
  tipChange: {
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '500',
  },
  tipAdds: {
    color: '#F59E0B',
  },
  fitCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  fitDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  fitLabel: {
    fontSize: 14,
    color: '#666',
  },
  fitValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  greenText: {
    color: '#22C55E',
  },
  redText: {
    color: '#EF4444',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  orderButton: {
    backgroundColor: '#000',
    borderRadius: 30,
    padding: 18,
    alignItems: 'center',
    marginBottom: 10,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  copyButtonText: {
    color: '#000',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  modalOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  modalOptionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  modalCancel: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
});
