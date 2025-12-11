import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../../context/UserContext';
import { searchBrandedFoods, POPULAR_BRANDS } from '../../services/api/nutritionix';

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

// Popular restaurant list with categories
const POPULAR_RESTAURANTS = [
  { id: 'chipotle', name: 'Chipotle', type: 'Mexican', category: 'Mexican' },
  { id: 'chickfila', name: "Chick-fil-A", type: 'Fast Food', category: 'Fast Food' },
  { id: 'mcdonalds', name: "McDonald's", type: 'Fast Food', category: 'Fast Food' },
  { id: 'sweetgreen', name: 'Sweetgreen', type: 'Salads', category: 'Healthy' },
  { id: 'panera', name: 'Panera Bread', type: 'Bakery & Cafe', category: 'Healthy' },
  { id: 'subway', name: 'Subway', type: 'Sandwiches', category: 'Fast Food' },
  { id: 'shakeshack', name: 'Shake Shack', type: 'Burgers', category: 'Fast Food' },
  { id: 'tacobell', name: 'Taco Bell', type: 'Mexican', category: 'Mexican' },
  { id: 'wendys', name: "Wendy's", type: 'Fast Food', category: 'Fast Food' },
  { id: 'starbucks', name: 'Starbucks', type: 'Coffee & Snacks', category: 'Cafe' },
  { id: 'cava', name: 'CAVA', type: 'Mediterranean', category: 'Healthy' },
  { id: 'jerseymikes', name: "Jersey Mike's", type: 'Sandwiches', category: 'Fast Food' },
  { id: 'buffalowildwings', name: 'Buffalo Wild Wings', type: 'American', category: 'American' },
  { id: 'whataburger', name: 'Whataburger', type: 'Burgers', category: 'Fast Food' },
  { id: 'sonic', name: 'Sonic', type: 'Fast Food', category: 'Fast Food' },
];

const FILTER_CATEGORIES = ['All', 'Fast Food', 'Healthy', 'Mexican', 'American', 'Cafe'];

export default function RestaurantResultsScreen({ navigation, route }) {
  const { user, addRecentRestaurant } = useUser();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [error, setError] = useState(null);

  const searchQuery = route?.params?.searchQuery;
  const showPopular = route?.params?.showPopular;

  useEffect(() => {
    loadRestaurants();
  }, [searchQuery, showPopular]);

  const loadRestaurants = async () => {
    setLoading(true);
    setError(null);

    try {
      if (searchQuery) {
        // Search via API
        const results = await searchBrandedFoods(searchQuery);

        // Group by brand_name to get unique restaurants
        const brandMap = new Map();
        results.forEach((item) => {
          if (item.brand_name && !brandMap.has(item.brand_name)) {
            brandMap.set(item.brand_name, {
              id: item.brand_name.toLowerCase().replace(/[^a-z]/g, ''),
              name: item.brand_name,
              type: 'Restaurant',
              brandId: item.brand_id,
            });
          }
        });

        setRestaurants(Array.from(brandMap.values()));
      } else {
        // Show popular restaurants
        setRestaurants(POPULAR_RESTAURANTS);
      }
    } catch (err) {
      console.error('Error loading restaurants:', err);
      setError('Unable to load restaurants. Showing popular options.');
      setRestaurants(POPULAR_RESTAURANTS);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantPress = (restaurant) => {
    addRecentRestaurant(restaurant);
    navigation.navigate('RestaurantDetail', { restaurant });
  };

  const filteredRestaurants = activeFilter === 'All'
    ? restaurants
    : restaurants.filter((r) => r.category === activeFilter);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>
          {searchQuery ? `Results for "${searchQuery}"` : 'Popular Restaurants'}
        </Text>
        <View style={{ width: 50 }} />
      </View>

      {!searchQuery && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterRow}
        >
          {FILTER_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.filter,
                activeFilter === category && styles.filterActive,
              ]}
              onPress={() => setActiveFilter(category)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === category && styles.filterTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ADE80" />
          <Text style={styles.loadingText}>Finding restaurants...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Text style={styles.resultCount}>
            {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
          </Text>

          {filteredRestaurants.map((restaurant, index) => (
            <TouchableOpacity
              key={restaurant.id || index}
              style={styles.card}
              onPress={() => handleRestaurantPress(restaurant)}
            >
              <Text style={styles.cardIcon}>{getRestaurantIcon(restaurant.name)}</Text>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardName}>{restaurant.name}</Text>
                </View>
                <Text style={styles.cardMeta}>{restaurant.type}</Text>
              </View>
              <Text style={styles.cardArrow}>→</Text>
            </TouchableOpacity>
          ))}

          {filteredRestaurants.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No restaurants found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search or browse popular options
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  backButton: {
    color: '#4ADE80',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  filterScroll: {
    maxHeight: 50,
  },
  filterRow: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    gap: 8,
  },
  filter: {
    marginRight: 8,
    backgroundColor: '#1F1F1F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterActive: {
    backgroundColor: '#4ADE80',
  },
  filterText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 16,
    marginTop: 12,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#F59E0B',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  resultCount: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cardMeta: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  cardArrow: {
    fontSize: 18,
    color: '#9CA3AF',
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
