import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { calculateUserMacros } from '../../utils/macroCalculator';

function getGoalLabel(goal) {
  switch (goal) {
    case 'bulk':
      return 'Build Muscle';
    case 'cut':
      return 'Lose Fat';
    case 'maintain':
      return 'Stay Fit';
    default:
      return 'Not set';
  }
}

function getActivityLabel(level) {
  switch (level) {
    case 'sedentary':
      return 'Sedentary';
    case 'light':
      return 'Light (1-2x/week)';
    case 'moderate':
      return 'Moderate (3-4x/week)';
    case 'active':
      return 'Active (5+x/week)';
    case 'very-active':
      return 'Very Active (Athlete)';
    default:
      return 'Not set';
  }
}

function formatHeight(inches) {
  if (!inches) return 'Not set';
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  return `${feet}'${remainingInches}"`;
}

export default function ProfileScreen({ navigation }) {
  const { user, resetUser } = useUser();
  const { signOut, isAuthenticated, user: authUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const getMacros = () => {
    if (user.macros?.calories) {
      return user.macros;
    }

    if (user.profile?.currentWeight && user.profile?.height && user.profile?.goal) {
      const calculated = calculateUserMacros(user.profile);
      return calculated.daily;
    }

    return {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
  };

  const macros = getMacros();

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await signOut();
              await resetUser();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Unable to log out. Please try again.');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Profile',
      'This will clear all your data and restart the onboarding process. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await resetUser();
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      label: 'Edit Profile',
      icon: 'person-outline',
      subtitle: user.profile?.goal ? `Goal: ${getGoalLabel(user.profile.goal)}` : 'Set up your profile',
      onPress: () => Alert.alert('Coming Soon', 'Profile editing will be available soon.'),
    },
    {
      label: 'Nutrition Goals',
      icon: 'flag-outline',
      subtitle: macros.calories ? `${macros.calories} cal / day` : 'Set your targets',
      onPress: () => Alert.alert('Coming Soon', 'Goal editing will be available soon.'),
    },
    {
      label: 'Dietary Restrictions',
      icon: 'alert-circle-outline',
      subtitle: user.restrictions?.allergies?.length > 0
        ? user.restrictions.allergies.slice(0, 2).join(', ') + (user.restrictions.allergies.length > 2 ? '...' : '')
        : 'None set',
      onPress: () => Alert.alert('Coming Soon', 'Restriction editing will be available soon.'),
    },
    {
      label: 'Food Preferences',
      icon: 'heart-outline',
      subtitle: 'Likes and dislikes',
      onPress: () => Alert.alert('Coming Soon', 'Preference editing will be available soon.'),
    },
    {
      label: 'Subscription',
      icon: 'card-outline',
      subtitle: 'Free plan',
      onPress: () => navigation.navigate('Paywall'),
    },
    {
      label: 'Help & Support',
      icon: 'help-circle-outline',
      subtitle: 'Get help using MacroMenu',
      onPress: () => Alert.alert('Support', 'Email us at support@macromenu.app'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color="#666" />
          </View>
          {authUser?.email && (
            <Text style={styles.emailText}>{authUser.email}</Text>
          )}
          <View style={styles.goalBadge}>
            <Text style={styles.goalBadgeText}>{getGoalLabel(user.profile?.goal)}</Text>
          </View>
        </View>

        {/* Stats Card */}
        {macros.calories > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>Daily Targets</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{macros.calories}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{macros.protein}g</Text>
                <Text style={styles.statLabel}>Protein</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{macros.carbs}g</Text>
                <Text style={styles.statLabel}>Carbs</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{macros.fat}g</Text>
                <Text style={styles.statLabel}>Fat</Text>
              </View>
            </View>
          </View>
        )}

        {/* Profile Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.cardTitle}>Your Stats</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Height</Text>
            <Text style={styles.detailValue}>{formatHeight(user.profile?.height)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Weight</Text>
            <Text style={styles.detailValue}>
              {user.profile?.currentWeight ? `${user.profile.currentWeight} lbs` : 'Not set'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Goal Weight</Text>
            <Text style={styles.detailValue}>
              {user.profile?.goalWeight ? `${user.profile.goalWeight} lbs` : 'Not set'}
            </Text>
          </View>
          <View style={[styles.detailRow, styles.detailRowLast]}>
            <Text style={styles.detailLabel}>Activity Level</Text>
            <Text style={styles.detailValue}>{getActivityLabel(user.profile?.activityLevel)}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={22} color="#000" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.subtitle && (
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetOnboarding}>
            <Ionicons name="refresh-outline" size={18} color="#F59E0B" />
            <Text style={styles.resetText}>Reset Profile & Restart Onboarding</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text style={styles.logoutText}>
              {isLoggingOut ? 'Logging out...' : 'Log Out'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>MacroMenu v1.0.0</Text>
      </ScrollView>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
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
    backgroundColor: '#fff',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  goalBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  goalBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E5E5E5',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailRowLast: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  dangerSection: {
    marginBottom: 24,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  resetText: {
    color: '#F59E0B',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginBottom: 32,
  },
});
