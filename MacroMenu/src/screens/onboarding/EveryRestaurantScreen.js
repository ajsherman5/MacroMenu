import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout';

export default function EveryRestaurantScreen({ navigation }) {
  return (
    <OnboardingLayout
      progress={12 / 20}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('FavoriteSpots')}
    >
      <Text style={styles.title}>MacroMenu has Every Restaurant in the world.</Text>
      <Text style={styles.subtitle}>
        MacroMenu has over 22 million restaurants. Bars, Fine Dining, Fast Food.
      </Text>

      <View style={styles.iconGrid}>
        <View style={styles.iconRow}>
          <View style={styles.iconBox}>
            <Ionicons name="fast-food-outline" size={48} color="#000" />
            <Text style={styles.iconLabel}>Fast Food</Text>
          </View>
          <View style={styles.iconBox}>
            <Ionicons name="restaurant-outline" size={48} color="#000" />
            <Text style={styles.iconLabel}>Fine Dining</Text>
          </View>
        </View>
        <View style={styles.iconRow}>
          <View style={styles.iconBox}>
            <Ionicons name="cafe-outline" size={48} color="#000" />
            <Text style={styles.iconLabel}>Cafes</Text>
          </View>
          <View style={styles.iconBox}>
            <Ionicons name="beer-outline" size={48} color="#000" />
            <Text style={styles.iconLabel}>Bars</Text>
          </View>
        </View>
        <View style={styles.iconRow}>
          <View style={styles.iconBox}>
            <Ionicons name="pizza-outline" size={48} color="#000" />
            <Text style={styles.iconLabel}>Local Spots</Text>
          </View>
          <View style={styles.iconBox}>
            <Ionicons name="globe-outline" size={48} color="#000" />
            <Text style={styles.iconLabel}>Worldwide</Text>
          </View>
        </View>
      </View>

      <View style={styles.statContainer}>
        <Text style={styles.statNumber}>22M+</Text>
        <Text style={styles.statLabel}>Restaurants</Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 8,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  iconGrid: {
    marginBottom: 40,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  iconBox: {
    width: 120,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  iconLabel: {
    fontSize: 13,
    color: '#666',
    marginTop: 8,
  },
  statContainer: {
    alignItems: 'center',
    backgroundColor: '#000',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignSelf: 'center',
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
});
