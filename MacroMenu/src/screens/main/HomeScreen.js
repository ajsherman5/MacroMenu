import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';

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
      navigation.navigate('RestaurantResults', { searchQuery: search.trim() });
    } finally {
      setSearching(false);
    }
  };

  const handleRestaurantPress = (restaurant) => {
    addRecentRestaurant(restaurant);
    navigation.navigate('RestaurantDetail', { restaurant });
  };

  // Default restaurants to show
  const defaultRestaurants = [
    { id: 'chipotle', name: 'Chipotle', type: 'Mexican', brandId: 'chipotle' },
    { id: 'chickfila', name: "Chick-fil-A", type: 'Fast Food', brandId: 'chickfila' },
    { id: 'cava', name: 'CAVA', type: 'Mediterranean', brandId: 'cava' },
  ];

  const recentRestaurants = user.recentRestaurants?.length > 0
    ? user.recentRestaurants.slice(0, 5)
    : defaultRestaurants;

  const favoriteRestaurants = user.preferences?.favoriteRestaurants || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.title}>What are you eating?</Text>
            {user.profile?.goal && (
              <View style={styles.goalBadge}>
                <Text style={styles.goalText}>{getGoalText(user.profile.goal)}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-outline" size={22} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search restaurants..."
            placeholderTextColor="#999"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searching && <ActivityIndicator color="#000" style={styles.searchLoader} />}
        </View>

        {/* AI Card */}
        <TouchableOpacity
          style={styles.aiCard}
          onPress={() => navigation.navigate('AIChat')}
          activeOpacity={0.7}
        >
          <View style={styles.aiIconContainer}>
            <Ionicons name="sparkles" size={24} color="#000" />
          </View>
          <View style={styles.aiContent}>
            <Text style={styles.aiTitle}>Ask AI</Text>
            <Text style={styles.aiSubtitle}>What should I order at...</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>

        {/* Daily Macros */}
        {user.macros?.calories && (
          <View style={styles.macrosCard}>
            <Text style={styles.macrosTitle}>Your Daily Targets</Text>
            <View style={styles.macrosRow}>
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{user.macros.calories}</Text>
                <Text style={styles.macroLabel}>cal</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={[styles.macroValue, styles.proteinText]}>{user.macros.protein}g</Text>
                <Text style={styles.macroLabel}>protein</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{user.macros.carbs}g</Text>
                <Text style={styles.macroLabel}>carbs</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={styles.macroValue}>{user.macros.fat}g</Text>
                <Text style={styles.macroLabel}>fat</Text>
              </View>
            </View>
          </View>
        )}

        {/* Favorite Spots */}
        {favoriteRestaurants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Favorites</Text>
            {favoriteRestaurants.slice(0, 4).map((restaurantId, index) => {
              const restaurant = {
                id: restaurantId,
                name: restaurantId.charAt(0).toUpperCase() + restaurantId.slice(1).replace(/([A-Z])/g, ' $1'),
                type: 'Restaurant',
                brandId: restaurantId,
              };
              const logo = getRestaurantLogo(restaurantId);
              return (
                <TouchableOpacity
                  key={`fav-${index}`}
                  style={styles.restaurantCard}
                  onPress={() => handleRestaurantPress(restaurant)}
                  activeOpacity={0.7}
                >
                  <View style={styles.restaurantIcon}>
                    {logo ? (
                      <Image source={logo} style={styles.restaurantLogo} resizeMode="contain" />
                    ) : (
                      <Ionicons name="restaurant-outline" size={24} color="#666" />
                    )}
                  </View>
                  <View style={styles.restaurantInfo}>
                    <Text style={styles.restaurantName}>{restaurant.name}</Text>
                    <Text style={styles.restaurantType}>Tap to see menu</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Recent */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent</Text>
          {recentRestaurants.map((restaurant, index) => {
            const logo = getRestaurantLogo(restaurant.name || restaurant.id);
            return (
              <TouchableOpacity
                key={restaurant.id || index}
                style={styles.restaurantCard}
                onPress={() => handleRestaurantPress(restaurant)}
                activeOpacity={0.7}
              >
                <View style={styles.restaurantIcon}>
                  {logo ? (
                    <Image source={logo} style={styles.restaurantLogo} resizeMode="contain" />
                  ) : (
                    <Ionicons name="restaurant-outline" size={24} color="#666" />
                  )}
                </View>
                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <Text style={styles.restaurantType}>{restaurant.type}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Browse All */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.browseCard}
            onPress={() => navigation.navigate('RestaurantResults', { showPopular: true })}
            activeOpacity={0.7}
          >
            <View style={styles.browseIcon}>
              <Ionicons name="grid-outline" size={24} color="#000" />
            </View>
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>Browse all restaurants</Text>
              <Text style={styles.restaurantType}>Find meals that fit your goals</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

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
  scroll: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
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
    marginBottom: 8,
  },
  goalBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  goalText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  profileButton: {
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#000',
  },
  aiIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  aiContent: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  aiSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  macrosCard: {
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
  macrosTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E5E5',
  },
  macroValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  proteinText: {
    color: '#000',
  },
  macroLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  restaurantCard: {
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
  restaurantIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  restaurantLogo: {
    width: 36,
    height: 36,
  },
  restaurantInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  restaurantType: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  browseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  browseIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
});
