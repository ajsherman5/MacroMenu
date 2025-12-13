import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useUser } from '../../context/UserContext';
import { findNearbyRestaurants, getApiStatus } from '../../services/api';

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

export default function NearbyScreen({ navigation }) {
  const { addRecentRestaurant } = useUser();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    requestLocation();
  }, []);

  const requestLocation = async () => {
    setLoading(true);
    setLocationError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setLocationError('Location permission denied');
        // Load nearby restaurants without location (uses mock data)
        const nearby = await findNearbyRestaurants(null, null);
        setRestaurants(nearby);
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation(currentLocation.coords);

      // Fetch nearby restaurants using Google Places API
      const nearby = await findNearbyRestaurants(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude,
        { radius: 8000 } // ~5 miles
      );

      setRestaurants(nearby);
    } catch (error) {
      console.error('Location error:', error);
      setLocationError('Unable to get location');
      // Fall back to mock data
      const nearby = await findNearbyRestaurants(null, null);
      setRestaurants(nearby);
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantPress = (restaurant) => {
    addRecentRestaurant(restaurant);
    navigation.navigate('RestaurantDetail', { restaurant });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Nearby</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={requestLocation}>
          <Ionicons name="refresh-outline" size={22} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Location Status */}
      <View style={styles.locationBar}>
        <Ionicons
          name={location ? "location" : "location-outline"}
          size={16}
          color={location ? "#22C55E" : "#666"}
        />
        <Text style={styles.locationText}>
          {location
            ? 'Using your current location'
            : locationError || 'Getting location...'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Finding restaurants near you...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {locationError && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color="#F59E0B" />
              <Text style={styles.errorText}>
                {locationError}. Showing popular restaurants instead.
              </Text>
            </View>
          )}

          <Text style={styles.resultCount}>
            {restaurants.length} restaurant{restaurants.length !== 1 ? 's' : ''} nearby
          </Text>

          {restaurants.map((restaurant, index) => {
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
                  <Text style={styles.addressText} numberOfLines={1}>
                    {restaurant.address}
                  </Text>
                </View>
                <View style={styles.cardRight}>
                  <View style={styles.distanceBadge}>
                    <Text style={styles.distanceBadgeText}>
                      {restaurant.distanceText || `${restaurant.distance?.toFixed(1) || '?'} mi`}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
              </TouchableOpacity>
            );
          })}

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
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
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginVertical: 12,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
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
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'hidden',
  },
  cardLogo: {
    width: 40,
    height: 40,
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
    color: '#666',
    fontSize: 14,
    marginTop: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  distanceText: {
    fontSize: 13,
    color: '#999',
    marginLeft: 4,
    marginRight: 8,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  distanceBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  distanceBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
});
