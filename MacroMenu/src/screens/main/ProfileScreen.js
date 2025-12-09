import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen({ navigation }) {
  const user = {
    goal: 'Build Muscle',
    calories: 2150,
    protein: 180,
    carbs: 215,
    fat: 72,
  };

  const menuItems = [
    { label: 'Edit Profile', icon: '👤' },
    { label: 'Nutrition Goals', icon: '🎯' },
    { label: 'Dietary Restrictions', icon: '🚫' },
    { label: 'Food Preferences', icon: '❤️' },
    { label: 'Notifications', icon: '🔔' },
    { label: 'Subscription', icon: '💳' },
    { label: 'Help & Support', icon: '❓' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.goalBadge}>{user.goal}</Text>
        </View>

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Daily Targets</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.calories}</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, styles.proteinText]}>{user.protein}g</Text>
              <Text style={styles.statLabel}>Protein</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.carbs}g</Text>
              <Text style={styles.statLabel}>Carbs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.fat}g</Text>
              <Text style={styles.statLabel}>Fat</Text>
            </View>
          </View>
        </View>

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity key={index} style={styles.menuItem}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
  scroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  profileCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    backgroundColor: '#1F1F1F',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 36,
  },
  goalBadge: {
    backgroundColor: '#1a2e1a',
    color: '#4ADE80',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  proteinText: {
    color: '#4ADE80',
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
  },
  menuArrow: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  logoutButton: {
    alignItems: 'center',
    padding: 16,
    marginBottom: 32,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
