import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, ActivityIndicator, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useUser } from '../../context/UserContext';
import { checkChainsNearby } from '../../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = 140;

// Restaurant logos - map normalized names to logo files
const logos = {
  chipotle: require('../../../assets/logos/chipotle.png'),
  shakeshack: require('../../../assets/logos/shakeshack.png'),
  jerseymikes: require('../../../assets/logos/jerseysmikes.png'),
  whataburger: require('../../../assets/logos/whataburger.png'),
  buffalowildwings: require('../../../assets/logos/buffalowildwings.png'),
  sonic: require('../../../assets/logos/sonic.png'),
  chickfila: require('../../../assets/logos/chickfila.png'),
  cava: require('../../../assets/logos/Cava-Logo.png'),
  mcdonalds: require('../../../assets/logos/mcdonalds.png'),
  subway: require('../../../assets/logos/subway.png'),
  starbucks: require('../../../assets/logos/starbucks.png'),
  panera: require('../../../assets/logos/panera.jpg'),
  panda: require('../../../assets/logos/panda.png'),
  burgerking: require('../../../assets/logos/burgerking.png'),
  sweetgreen: require('../../../assets/logos/sweetgreen.png'),
  qdoba: require('../../../assets/logos/qdoba.png'),
  innout: require('../../../assets/logos/innout.png'),
  zaxbys: require('../../../assets/logos/zaxbys.png'),
  jimmyjohns: require('../../../assets/logos/jimmyjohns.png'),
  potbelly: require('../../../assets/logos/potbelly.png'),
  noodles: require('../../../assets/logos/noodles.png'),
  mod: require('../../../assets/logos/mod.png'),
  firehouse: require('../../../assets/logos/firehouse.png'),
  tacobell: require('../../../assets/logos/tacobell.png'),
};

function getRestaurantLogo(name) {
  const normalized = name.toLowerCase().replace(/[^a-z]/g, '');
  // Check for common variations
  if (normalized.includes('chickfil')) return logos.chickfila;
  if (normalized.includes('shakeshack')) return logos.shakeshack;
  if (normalized.includes('jerseymic') || normalized.includes('jerseymik')) return logos.jerseymikes;
  if (normalized.includes('buffalowild')) return logos.buffalowildwings;
  if (normalized.includes('panda')) return logos.panda;
  if (normalized.includes('innout') || normalized.includes('inandout')) return logos.innout;
  if (normalized.includes('firehouse')) return logos.firehouse;
  if (normalized.includes('jimmyjohn')) return logos.jimmyjohns;
  if (normalized.includes('tacobell')) return logos.tacobell;
  return logos[normalized] || null;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getGoalEmoji(goal) {
  switch (goal) {
    case 'bulk': return '💪';
    case 'cut': return '🔥';
    case 'maintain': return '⚖️';
    default: return '';
  }
}

function getGoalText(goal) {
  switch (goal) {
    case 'bulk': return 'Building muscle';
    case 'cut': return 'Cutting fat';
    case 'maintain': return 'Staying fit';
    default: return '';
  }
}

// Popular restaurant categories with chains
const RESTAURANT_CATEGORIES = [
  {
    title: 'Popular Right Now',
    icon: 'flame-outline',
    restaurants: [
      { id: 'chipotle', name: 'Chipotle', type: 'Mexican' },
      { id: 'chickfila', name: "Chick-fil-A", type: 'Chicken' },
      { id: 'cava', name: 'CAVA', type: 'Mediterranean' },
      { id: 'sweetgreen', name: 'Sweetgreen', type: 'Salads' },
      { id: 'shakeshack', name: 'Shake Shack', type: 'Burgers' },
      { id: 'panera', name: 'Panera Bread', type: 'Bakery Cafe' },
    ],
  },
  {
    title: 'High Protein Picks',
    icon: 'barbell-outline',
    restaurants: [
      { id: 'chickfila', name: "Chick-fil-A", type: 'Chicken' },
      { id: 'chipotle', name: 'Chipotle', type: 'Mexican' },
      { id: 'qdoba', name: 'Qdoba', type: 'Mexican' },
      { id: 'buffalowildwings', name: 'Buffalo Wild Wings', type: 'Wings' },
      { id: 'zaxbys', name: "Zaxby's", type: 'Chicken' },
      { id: 'firehouse', name: 'Firehouse Subs', type: 'Subs' },
    ],
  },
  {
    title: 'Fast & Fresh',
    icon: 'leaf-outline',
    restaurants: [
      { id: 'sweetgreen', name: 'Sweetgreen', type: 'Salads' },
      { id: 'cava', name: 'CAVA', type: 'Mediterranean' },
      { id: 'panera', name: 'Panera Bread', type: 'Bakery Cafe' },
      { id: 'subway', name: 'Subway', type: 'Subs' },
      { id: 'noodles', name: 'Noodles & Co', type: 'Noodles' },
      { id: 'potbelly', name: 'Potbelly', type: 'Sandwiches' },
    ],
  },
  {
    title: 'Burgers & More',
    icon: 'fast-food-outline',
    restaurants: [
      { id: 'shakeshack', name: 'Shake Shack', type: 'Burgers' },
      { id: 'innout', name: 'In-N-Out', type: 'Burgers' },
      { id: 'whataburger', name: 'Whataburger', type: 'Burgers' },
      { id: 'sonic', name: 'Sonic', type: 'Drive-In' },
      { id: 'burgerking', name: 'Burger King', type: 'Burgers' },
      { id: 'mcdonalds', name: "McDonald's", type: 'Fast Food' },
    ],
  },
  {
    title: 'Mexican Favorites',
    icon: 'restaurant-outline',
    restaurants: [
      { id: 'chipotle', name: 'Chipotle', type: 'Mexican' },
      { id: 'qdoba', name: 'Qdoba', type: 'Mexican' },
      { id: 'tacobell', name: 'Taco Bell', type: 'Mexican' },
    ],
  },
  {
    title: 'Subs & Sandwiches',
    icon: 'nutrition-outline',
    restaurants: [
      { id: 'jerseymikes', name: "Jersey Mike's", type: 'Subs' },
      { id: 'subway', name: 'Subway', type: 'Subs' },
      { id: 'firehouse', name: 'Firehouse Subs', type: 'Subs' },
      { id: 'jimmyjohns', name: "Jimmy John's", type: 'Subs' },
      { id: 'potbelly', name: 'Potbelly', type: 'Sandwiches' },
    ],
  },
];

// Radius in miles for filtering chains
const NEARBY_RADIUS_MILES = 30;

export default function HomeScreen({ navigation }) {
  const { user, addRecentRestaurant } = useUser();
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [location, setLocation] = useState(null);
  const [chainAvailability, setChainAvailability] = useState({});
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [filteredCategories, setFilteredCategories] = useState(RESTAURANT_CATEGORIES);

  // Get user location and check chain availability on mount
  useEffect(() => {
    checkLocationAndFilterChains();
  }, []);

  const checkLocationAndFilterChains = async () => {
    setLoadingLocation(true);

    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.log('Location permission denied, showing all chains');
        setLoadingLocation(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;
      setLocation({ latitude, longitude });

      // Get all unique chain names from categories
      const allChainNames = [...new Set(
        RESTAURANT_CATEGORIES.flatMap(cat =>
          cat.restaurants.map(r => r.name)
        )
      )];

      // Check which chains are nearby
      const availability = await checkChainsNearby(
        allChainNames,
        latitude,
        longitude,
        NEARBY_RADIUS_MILES
      );

      setChainAvailability(availability);

      // Filter categories to only show available chains
      const filtered = RESTAURANT_CATEGORIES.map(category => ({
        ...category,
        restaurants: category.restaurants.filter(r => availability[r.name] !== false)
      })).filter(category => category.restaurants.length > 0);

      setFilteredCategories(filtered);
    } catch (error) {
      console.error('Error getting location:', error);
      // On error, show all chains
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      navigation.navigate('RestaurantResults', { searchQuery: search.trim() });
    } finally {
      setSearching(false);
    }
  };

  const handleRestaurantPress = (restaurant) => {
    addRecentRestaurant(restaurant);
    navigation.navigate('RestaurantDetail', { restaurant });
  };

  const favoriteRestaurants = user.preferences?.favoriteRestaurants || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.title}>Find your meal</Text>
            </View>
            {user.profile?.goal && (
              <View style={styles.goalBadge}>
                <Text style={styles.goalEmoji}>{getGoalEmoji(user.profile.goal)}</Text>
                <Text style={styles.goalText}>{getGoalText(user.profile.goal)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search any restaurant..."
            placeholderTextColor="#999"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searching && <ActivityIndicator color="#000" style={styles.searchLoader} />}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Nearby')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="location" size={22} color="#22C55E" />
            </View>
            <Text style={styles.quickActionText}>Nearby</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('Recommended')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="star" size={22} color="#F59E0B" />
            </View>
            <Text style={styles.quickActionText}>For You</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => navigation.navigate('AIChat')}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#F3E8FF' }]}>
              <Ionicons name="sparkles" size={22} color="#8B5CF6" />
            </View>
            <Text style={styles.quickActionText}>Ask AI</Text>
          </TouchableOpacity>
        </View>

        {/* Favorites - only show if user has favorite restaurants */}
        {favoriteRestaurants.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart" size={20} color="#EF4444" />
              <Text style={styles.sectionTitle}>Favorites</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {favoriteRestaurants.map((restaurant, index) => {
                const logo = getRestaurantLogo(restaurant.name || restaurant.id);
                return (
                  <TouchableOpacity
                    key={`favorite-${restaurant.id || index}`}
                    style={styles.favoriteCard}
                    onPress={() => handleRestaurantPress(restaurant)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.favoriteLogo}>
                      {logo ? (
                        <Image source={logo} style={styles.favoriteLogoImage} resizeMode="contain" />
                      ) : (
                        <Ionicons name="restaurant-outline" size={24} color="#666" />
                      )}
                    </View>
                    <Text style={styles.favoriteName} numberOfLines={1}>{restaurant.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Restaurant Categories */}
        {loadingLocation && (
          <View style={styles.loadingLocationContainer}>
            <ActivityIndicator size="small" color="#22C55E" />
            <Text style={styles.loadingLocationText}>Finding restaurants near you...</Text>
          </View>
        )}
        {filteredCategories.map((category, categoryIndex) => (
          <View key={`category-${categoryIndex}`} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={category.icon} size={20} color="#666" />
              <Text style={styles.sectionTitle}>{category.title}</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
              {category.restaurants.map((restaurant, index) => {
                const logo = getRestaurantLogo(restaurant.name || restaurant.id);
                return (
                  <TouchableOpacity
                    key={`${category.title}-${restaurant.id}-${index}`}
                    style={styles.restaurantCard}
                    onPress={() => handleRestaurantPress(restaurant)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardLogo}>
                      {logo ? (
                        <Image source={logo} style={styles.cardLogoImage} resizeMode="contain" />
                      ) : (
                        <View style={styles.cardLogoPlaceholder}>
                          <Text style={styles.cardLogoInitial}>{restaurant.name.charAt(0)}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardName} numberOfLines={1}>{restaurant.name}</Text>
                    <Text style={styles.cardType}>{restaurant.type}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scroll: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  goalEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  goalText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#000',
  },
  searchLoader: {
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 28,
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginLeft: 8,
  },
  horizontalScroll: {
    paddingLeft: 24,
  },
  // Favorite cards (circular)
  favoriteCard: {
    width: 90,
    marginRight: 12,
    alignItems: 'center',
  },
  favoriteLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  favoriteLogoImage: {
    width: 44,
    height: 44,
  },
  favoriteName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  // Restaurant cards
  restaurantCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardLogoImage: {
    width: 40,
    height: 40,
  },
  cardLogoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLogoInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#999',
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  cardType: {
    fontSize: 12,
    color: '#999',
  },
  loadingLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  loadingLocationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
});
