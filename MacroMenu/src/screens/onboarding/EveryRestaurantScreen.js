import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import OnboardingLayout from '../../components/OnboardingLayout';

// Restaurant logos - 8 premium casual chains
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

const restaurantLogos = [
  { key: 'chipotle' },
  { key: 'shakeshack' },
  { key: 'jerseymikes' },
  { key: 'whataburger' },
  { key: 'buffalowildwings' },
  { key: 'sonic' },
  { key: 'chickfila' },
  { key: 'cava' },
];

const features = [
  { label: "AI-Powered Picks", icon: "sparkles", description: "Meals matched to your goals" },
  { label: "Real-time Nutrition", icon: "nutrition-outline", description: "Accurate macro data" },
  { label: "Any Diet, Any Goal", icon: "checkmark-circle-outline", description: "Keto, bulk, cut & more" },
];

export default function EveryRestaurantScreen({ navigation }) {
  const [count, setCount] = useState(0);
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Animated counter - reaches 22M in 3 seconds
  useEffect(() => {
    const target = 22000000;
    const duration = 3000;
    let startTime = null;
    let animationId = null;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(target * eased));

      if (progress < 1) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  // Fade in and scale animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Auto-scroll logos
  useEffect(() => {
    const scrollLoop = () => {
      scrollAnim.setValue(0);
      Animated.timing(scrollAnim, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => scrollLoop());
    };
    scrollLoop();
  }, []);

  const formatNumber = (num) => {
    // Always show decimal for counting effect (e.g., "1.2M", "15.7M", "22M")
    if (num >= 1000000) {
      const millions = num / 1000000;
      if (num >= 22000000) {
        return '22M'; // Final state
      }
      return millions.toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return Math.floor(num / 1000) + 'K';
    }
    return num.toString();
  };

  const translateX = scrollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -832], // 8 logos * 104px (80 + 24 margin)
  });

  return (
    <OnboardingLayout
      progress={12 / 20}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('FavoriteSpots')}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.title}>Every Restaurant.{'\n'}One App.</Text>

        {/* Animated Counter */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterNumber}>{formatNumber(count)}+</Text>
          <Text style={styles.counterLabel}>restaurants worldwide</Text>
        </View>

        {/* Scrolling Restaurant Logos */}
        <View style={styles.logoScrollContainer}>
          <Animated.View style={[styles.logoRow, { transform: [{ translateX }] }]}>
            {[...restaurantLogos, ...restaurantLogos, ...restaurantLogos, ...restaurantLogos].map((restaurant, index) => (
              <Image
                key={index}
                source={logos[restaurant.key]}
                style={styles.logoImage}
                resizeMode="contain"
              />
            ))}
          </Animated.View>
        </View>

        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          {features.map((feature) => (
            <View key={feature.label} style={styles.featureCard}>
              <View style={styles.featureIconContainer}>
                <Ionicons name={feature.icon} size={22} color="#4ADE80" />
              </View>
              <Text style={styles.featureLabel}>{feature.label}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </View>
          ))}
        </View>

        {/* Bottom Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="globe-outline" size={24} color="#4ADE80" />
            <Text style={styles.statValue}>195</Text>
            <Text style={styles.statLabel}>Countries</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="pizza-outline" size={24} color="#4ADE80" />
            <Text style={styles.statValue}>500+</Text>
            <Text style={styles.statLabel}>Cuisines</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={24} color="#4ADE80" />
            <Text style={styles.statValue}>24/7</Text>
            <Text style={styles.statLabel}>Updated</Text>
          </View>
        </View>
      </Animated.View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 40,
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  counterNumber: {
    fontSize: 56,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -2,
  },
  counterLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  logoScrollContainer: {
    height: 60,
    overflow: 'hidden',
    marginBottom: 32,
    marginHorizontal: -24,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoImage: {
    width: 80,
    height: 50,
    marginRight: 24,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 12,
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8FBF0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 6,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5E5',
  },
});
