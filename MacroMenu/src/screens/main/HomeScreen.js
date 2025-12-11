import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../context/UserContext';
import { searchRestaurants } from '../../services/api/nutritionix';

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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getGoalText(goal) {
  switch (goal) {
    case 'bulk':
      return 'Building muscle';
    case 'cut':
      return 'Cutting fat';
    case 'maintain':
      return 'Staying fit';
    default:
      return '';
  }
}

export default function HomeScreen({ navigation }) {
  const { user, addRecentRestaurant } = useUser();
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) return;

    setSearching(true);
    try {
      // Navigate to results with search query
      navigation.navigate('RestaurantResults', { searchQuery: search.trim() });
    } finally {
      setSearching(false);
    }
  };

  const handleRestaurantPress = (restaurant) => {
    addRecentRestaurant(restaurant);
    navigation.navigate('RestaurantDetail', { restaurant });
  };

  // Get recent restaurants from user context or use defaults
  const recentRestaurants = user.recentRestaurants.length > 0
    ? user.recentRestaurants.slice(0, 5)
    : [
        { id: 'chipotle', name: 'Chipotle', type: 'Mexican', brandId: 'chipotle' },
        { id: 'chickfila', name: "Chick-fil-A", type: 'Fast Food', brandId: 'chick-fil-a' },
        { id: 'sweetgreen', name: 'Sweetgreen', type: 'Salads', brandId: 'sweetgreen' },
      ];

  // Favorite restaurants from preferences
  const favoriteRestaurants = user.preferences?.favoriteRestaurants || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.title}>What are you eating?</Text>
            {user.profile?.goal && (
              <Text style={styles.goalText}>{getGoalText(user.profile.goal)}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search restaurants..."
            placeholderTextColor="#6B7280"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.searchIcon}>🔍</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.aiCard}
          onPress={() => navigation.navigate('AIChat')}
        >
          <Text style={styles.aiIcon}>🤖</Text>
          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>Ask AI</Text>
            <Text style={styles.aiSubtitle}>What should I order at...</Text>
          </View>
          <Text style={styles.aiArrow}>→</Text>
        </TouchableOpacity>

        {/* Daily macros summary if available */}
        {user.macros?.calories && (
          <View style={styles.macrosSummary}>
            <Text style={styles.macrosTitle}>Your Daily Targets</Text>
            <View style={styles.macrosRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{user.macros.calories}</Text>
                <Text style={styles.macroLabel}>cal</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, styles.proteinText]}>{user.macros.protein}g</Text>
                <Text style={styles.macroLabel}>protein</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{user.macros.carbs}g</Text>
                <Text style={styles.macroLabel}>carbs</Text>
              </View>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{user.macros.fat}g</Text>
                <Text style={styles.macroLabel}>fat</Text>
              </View>
            </View>
          </View>
        )}

        {/* Favorite spots from onboarding */}
        {favoriteRestaurants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Favorites</Text>
            {favoriteRestaurants.slice(0, 4).map((restaurant, index) => (
              <TouchableOpacity
                key={`fav-${index}`}
                style={styles.restaurantCard}
                onPress={() => handleRestaurantPress({
                  id: restaurant.toLowerCase().replace(/[^a-z]/g, ''),
                  name: restaurant,
                  type: 'Restaurant',
                  brandId: restaurant.toLowerCase().replace(/[^a-z]/g, ''),
                })}
              >
                <Text style={styles.restaurantIcon}>{getRestaurantIcon(restaurant)}</Text>
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant}</Text>
                  <Text style={styles.restaurantType}>Tap to see menu</Text>
                </View>
                <Text style={styles.restaurantArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent</Text>
          {recentRestaurants.map((restaurant, index) => (
            <TouchableOpacity
              key={restaurant.id || index}
              style={styles.restaurantCard}
              onPress={() => handleRestaurantPress(restaurant)}
            >
              <Text style={styles.restaurantIcon}>{getRestaurantIcon(restaurant.name)}</Text>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantType}>{restaurant.type}</Text>
              </View>
              <Text style={styles.restaurantArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Chains</Text>
          <TouchableOpacity
            style={styles.restaurantCard}
            onPress={() => navigation.navigate('RestaurantResults', { showPopular: true })}
          >
            <Text style={styles.restaurantIcon}>📍</Text>
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>Browse all restaurants</Text>
              <Text style={styles.restaurantType}>Find meals that fit your goals</Text>
            </View>
            <Text style={styles.restaurantArrow}>→</Text>
          </TouchableOpacity>
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
  scroll: {
    flex: 1,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  goalText: {
    fontSize: 14,
    color: '#4ADE80',
    marginTop: 4,
  },
  profileButton: {
    width: 44,
    height: 44,
    backgroundColor: '#1F1F1F',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    marginRight: 12,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#fff',
  },
  searchButton: {
    width: 56,
    backgroundColor: '#4ADE80',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 24,
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2e1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#4ADE80',
  },
  aiIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4ADE80',
  },
  aiSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  aiArrow: {
    fontSize: 20,
    color: '#4ADE80',
  },
  macrosSummary: {
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  macrosTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 12,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  restaurantIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  restaurantType: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  restaurantArrow: {
    fontSize: 18,
    color: '#9CA3AF',
  },
});
