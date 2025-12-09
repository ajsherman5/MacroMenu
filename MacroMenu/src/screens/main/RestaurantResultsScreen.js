import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const restaurants = [
  { id: '1', name: 'Chipotle', type: 'Mexican', distance: '0.3 mi', rating: '92%', icon: '🌯' },
  { id: '2', name: "Chick-fil-A", type: 'Fast Food', distance: '0.5 mi', rating: '88%', icon: '🍗' },
  { id: '3', name: 'Sweetgreen', type: 'Salads', distance: '0.7 mi', rating: '95%', icon: '🥗' },
  { id: '4', name: "McDonald's", type: 'Fast Food', distance: '0.2 mi', rating: '72%', icon: '🍔' },
  { id: '5', name: 'Panera Bread', type: 'Bakery & Cafe', distance: '0.8 mi', rating: '85%', icon: '🥖' },
  { id: '6', name: 'Subway', type: 'Sandwiches', distance: '0.4 mi', rating: '78%', icon: '🥪' },
];

export default function RestaurantResultsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nearby Restaurants</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filter, styles.filterActive]}>
          <Text style={styles.filterTextActive}>All</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filter}>
          <Text style={styles.filterText}>Fast Food</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filter}>
          <Text style={styles.filterText}>Healthy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filter}>
          <Text style={styles.filterText}>Mexican</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultCount}>{restaurants.length} restaurants found</Text>

        {restaurants.map((restaurant) => (
          <TouchableOpacity
            key={restaurant.id}
            style={styles.card}
            onPress={() => navigation.navigate('RestaurantDetail', { restaurant })}
          >
            <Text style={styles.cardIcon}>{restaurant.icon}</Text>
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName}>{restaurant.name}</Text>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>{restaurant.rating} match</Text>
                </View>
              </View>
              <Text style={styles.cardMeta}>
                {restaurant.type} • {restaurant.distance}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
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
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  resultCount: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
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
  ratingBadge: {
    backgroundColor: '#1a2e1a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '600',
  },
  cardMeta: {
    color: '#9CA3AF',
    fontSize: 14,
  },
});
