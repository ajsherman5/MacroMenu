import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  // Calculate macros from profile if not stored
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
              // Navigation will be handled by auth state change
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
      icon: '👤',
      subtitle: user.profile?.goal ? `Goal: ${getGoalLabel(user.profile.goal)}` : 'Set up your profile',
      onPress: () => Alert.alert('Coming Soon', 'Profile editing will be available soon.'),
    },
    {
      label: 'Nutrition Goals',
      icon: '🎯',
      subtitle: macros.calories ? `${macros.calories} cal / day` : 'Set your targets',
      onPress: () => Alert.alert('Coming Soon', 'Goal editing will be available soon.'),
    },
    {
      label: 'Dietary Restrictions',
      icon: '🚫',
      subtitle: user.restrictions?.allergies?.length > 0
        ? user.restrictions.allergies.slice(0, 2).join(', ') + (user.restrictions.allergies.length > 2 ? '...' : '')
        : 'None set',
      onPress: () => Alert.alert('Coming Soon', 'Restriction editing will be available soon.'),
    },
    {
      label: 'Food Preferences',
      icon: '❤️',
      subtitle: 'Likes and dislikes',
      onPress: () => Alert.alert('Coming Soon', 'Preference editing will be available soon.'),
    },
    {
      label: 'Subscription',
      icon: '💳',
      subtitle: 'Free plan',
      onPress: () => navigation.navigate('Paywall'),
    },
    {
      label: 'Help & Support',
      icon: '❓',
      subtitle: 'Get help using MacroMenu',
      onPress: () => Alert.alert('Support', 'Email us at support@macromenu.app'),
    },
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
            <Text style={styles.statsTitle}>Daily Targets</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{macros.calories}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, styles.proteinText]}>{macros.protein}g</Text>
                <Text style={styles.statLabel}>Protein</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{macros.carbs}g</Text>
                <Text style={styles.statLabel}>Carbs</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{macros.fat}g</Text>
                <Text style={styles.statLabel}>Fat</Text>
              </View>
            </View>
          </View>
        )}

        {/* Profile Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Your Stats</Text>
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
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Activity Level</Text>
            <Text style={styles.detailValue}>{getActivityLabel(user.profile?.activityLevel)}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                {item.subtitle && (
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              <Text style={styles.menuArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetOnboarding}>
            <Text style={styles.resetText}>Reset Profile & Restart Onboarding</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={isLoggingOut}
          >
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
  emailText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  goalBadge: {
    backgroundColor: '#1a2e1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  goalBadgeText: {
    color: '#4ADE80',
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  detailsCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailLabel: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
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
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    color: '#fff',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  dangerSection: {
    marginBottom: 24,
    gap: 12,
  },
  resetButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
  },
  resetText: {
    color: '#F59E0B',
    fontSize: 16,
  },
  logoutButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 32,
  },
});
