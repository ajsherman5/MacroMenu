import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboarding } from '../../context';

const categories = {
  cuisines: {
    title: 'Cuisines',
    items: [
      { id: 'american', label: 'American', emoji: '🍔' },
      { id: 'mexican', label: 'Mexican', emoji: '🌮' },
      { id: 'italian', label: 'Italian', emoji: '🍝' },
      { id: 'asian', label: 'Asian', emoji: '🍜' },
      { id: 'indian', label: 'Indian', emoji: '🍛' },
      { id: 'mediterranean', label: 'Mediterranean', emoji: '🥙' },
      { id: 'japanese', label: 'Japanese', emoji: '🍣' },
      { id: 'thai', label: 'Thai', emoji: '🥡' },
    ],
  },
  entrees: {
    title: 'Entrees',
    items: [
      { id: 'burger', label: 'Burger', emoji: '🍔' },
      { id: 'pizza', label: 'Pizza', emoji: '🍕' },
      { id: 'tacos', label: 'Tacos', emoji: '🌮' },
      { id: 'burrito', label: 'Burrito', emoji: '🌯' },
      { id: 'bowl', label: 'Bowl', emoji: '🥗' },
      { id: 'sandwich', label: 'Sandwich', emoji: '🥪' },
      { id: 'wrap', label: 'Wrap', emoji: '🫔' },
      { id: 'pasta', label: 'Pasta', emoji: '🍝' },
      { id: 'salad', label: 'Salad', emoji: '🥬' },
      { id: 'soup', label: 'Soup', emoji: '🍲' },
    ],
  },
  proteins: {
    title: 'Proteins',
    items: [
      { id: 'chicken', label: 'Chicken', emoji: '🍗' },
      { id: 'beef', label: 'Beef', emoji: '🥩' },
      { id: 'pork', label: 'Pork', emoji: '🥓' },
      { id: 'fish', label: 'Fish', emoji: '🐟' },
      { id: 'shrimp', label: 'Shrimp', emoji: '🦐' },
      { id: 'tofu', label: 'Tofu', emoji: '🧈' },
      { id: 'turkey', label: 'Turkey', emoji: '🦃' },
      { id: 'eggs', label: 'Eggs', emoji: '🥚' },
    ],
  },
  sides: {
    title: 'Sides & Extras',
    items: [
      { id: 'fries', label: 'Fries', emoji: '🍟' },
      { id: 'rice', label: 'Rice', emoji: '🍚' },
      { id: 'beans', label: 'Beans', emoji: '🫘' },
      { id: 'veggies', label: 'Veggies', emoji: '🥦' },
      { id: 'cheese', label: 'Cheese', emoji: '🧀' },
      { id: 'guac', label: 'Guacamole', emoji: '🥑' },
      { id: 'bread', label: 'Bread', emoji: '🍞' },
      { id: 'chips', label: 'Chips', emoji: '🌽' },
    ],
  },
  flavors: {
    title: 'Flavor Profiles',
    items: [
      { id: 'spicy', label: 'Spicy', emoji: '🌶️' },
      { id: 'savory', label: 'Savory', emoji: '🧂' },
      { id: 'sweet', label: 'Sweet', emoji: '🍯' },
      { id: 'tangy', label: 'Tangy', emoji: '🍋' },
      { id: 'smoky', label: 'Smoky', emoji: '🔥' },
      { id: 'fresh', label: 'Fresh', emoji: '🌿' },
    ],
  },
};

export default function FoodLikesScreen({ navigation }) {
  const [selected, setSelected] = useState({});
  const { updateOnboarding } = useOnboarding();

  const handleContinue = () => {
    // Convert selected object to foodLikes format expected by context
    updateOnboarding({
      foodLikes: {
        cuisines: selected.cuisines || [],
        entrees: selected.entrees || [],
        proteins: selected.proteins || [],
        sides: selected.sides || [],
        flavors: selected.flavors || [],
      },
    });
    navigation.navigate('FoodDislikes');
  };

  const toggle = (categoryKey, itemId) => {
    setSelected((prev) => {
      const categoryItems = prev[categoryKey] || [];
      if (categoryItems.includes(itemId)) {
        return { ...prev, [categoryKey]: categoryItems.filter((id) => id !== itemId) };
      } else {
        return { ...prev, [categoryKey]: [...categoryItems, itemId] };
      }
    });
  };

  const isSelected = (categoryKey, itemId) => {
    return (selected[categoryKey] || []).includes(itemId);
  };

  const totalSelected = Object.values(selected).flat().length;

  return (
    <OnboardingLayout
      progress={14 / 20}
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
      continueDisabled={totalSelected === 0}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>What do you love to eat?</Text>
        <Text style={styles.subtitle}>
          Tap all that apply - we'll find meals you'll actually enjoy
        </Text>

        {Object.entries(categories).map(([key, category]) => (
          <View key={key} style={styles.section}>
            <Text style={styles.sectionTitle}>{category.title}</Text>
            <View style={styles.chipContainer}>
              {category.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.chip,
                    isSelected(key, item.id) && styles.chipSelected,
                  ]}
                  onPress={() => toggle(key, item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chipEmoji}>{item.emoji}</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      isSelected(key, item.id) && styles.chipLabelSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#E5E5E5',
  },
  chipSelected: {
    borderColor: '#4ADE80',
    backgroundColor: '#E8FBF0',
  },
  chipEmoji: {
    fontSize: 18,
    marginRight: 6,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  chipLabelSelected: {
    color: '#000',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});
