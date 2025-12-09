import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const recentRestaurants = [
  { id: '1', name: 'Chipotle', type: 'Mexican', icon: '🌯' },
  { id: '2', name: "Chick-fil-A", type: 'Fast Food', icon: '🍗' },
  { id: '3', name: 'Sweetgreen', type: 'Salads', icon: '🥗' },
];

export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good afternoon</Text>
            <Text style={styles.title}>What are you eating?</Text>
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
          />
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => navigation.navigate('RestaurantResults')}
          >
            <Text style={styles.scanIcon}>📷</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent</Text>
          {recentRestaurants.map((restaurant) => (
            <TouchableOpacity
              key={restaurant.id}
              style={styles.restaurantCard}
              onPress={() => navigation.navigate('RestaurantDetail', { restaurant })}
            >
              <Text style={styles.restaurantIcon}>{restaurant.icon}</Text>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <Text style={styles.restaurantType}>{restaurant.type}</Text>
              </View>
              <Text style={styles.restaurantArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Nearby</Text>
          <TouchableOpacity
            style={styles.restaurantCard}
            onPress={() => navigation.navigate('RestaurantResults')}
          >
            <Text style={styles.restaurantIcon}>📍</Text>
            <View style={styles.restaurantInfo}>
              <Text style={styles.restaurantName}>Find restaurants near me</Text>
              <Text style={styles.restaurantType}>Use your location</Text>
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
  scanButton: {
    width: 56,
    backgroundColor: '#4ADE80',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanIcon: {
    fontSize: 24,
  },
  aiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2e1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
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
