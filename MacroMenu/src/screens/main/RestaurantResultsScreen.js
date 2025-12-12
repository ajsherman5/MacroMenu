import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';
import { searchBrandedFoods } from '../../services/api/nutritionix';

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
  const { addRecentRestaurant } = useUser();
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
        const results = await searchBrandedFoods(searchQuery);
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {searchQuery ? `"${searchQuery}"` : 'Popular Restaurants'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter chips */}
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
                styles.filterChip,
                activeFilter === category && styles.filterChipActive,
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
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Finding restaurants...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#F59E0B" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <Text style={styles.resultCount}>
            {filteredRestaurants.length} restaurant{filteredRestaurants.length !== 1 ? 's' : ''} found
          </Text>

          {filteredRestaurants.map((restaurant, index) => {
            const logo = getRestaurantLogo(restaurant.name);
            return (
              <TouchableOpacity
                key={restaurant.id || index}
                style={styles.card}
                onPress={() => handleRestaurantPress(restaurant)}
                activeOpacity={0.7}
              >
                <View style={styles.cardIcon}>
                  {logo ? (
                    <Image source={logo} style={styles.cardLogo} resizeMode="contain" />
                  ) : (
                    <Ionicons name="restaurant-outline" size={24} color="#666" />
                  )}
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardName}>{restaurant.name}</Text>
                  <Text style={styles.cardMeta}>{restaurant.type}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            );
          })}

          {filteredRestaurants.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="search-outline" size={48} color="#999" />
              </View>
              <Text style={styles.emptyTitle}>No restaurants found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search or browse popular options
              </Text>
            </View>
          )}

          <View style={{ height: 40 }} />
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  filterScroll: {
    maxHeight: 50,
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#92400E',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  resultCount: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  cardLogo: {
    width: 36,
    height: 36,
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  cardMeta: {
    color: '#999',
    fontSize: 14,
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
});
