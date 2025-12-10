import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import OnboardingLayout from '../../components/OnboardingLayout';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MIN_WEIGHT = 80;
const MAX_WEIGHT = 350;
const TICK_SPACING = 6;
const TOTAL_TICKS = MAX_WEIGHT - MIN_WEIGHT + 1;
const CENTER_OFFSET = SCREEN_WIDTH / 2;

export default function GoalWeightScreen({ navigation, route }) {
  const currentWeight = route?.params?.currentWeight || 150;
  const goal = route?.params?.goal;

  // Set initial goal weight based on goal type
  const getInitialGoalWeight = () => {
    if (goal === 'cut') {
      return currentWeight - 10;
    } else if (goal === 'bulk') {
      return currentWeight + 10;
    }
    return currentWeight;
  };

  const [goalWeight, setGoalWeight] = useState(getInitialGoalWeight());
  const scrollRef = useRef(null);
  const initialScrollDone = useRef(false);

  const diff = goalWeight - currentWeight;
  const isGaining = diff > 0;
  const label = isGaining ? 'Gain Weight' : diff < 0 ? 'Lose Weight' : 'Maintain';

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newWeight = Math.round(offsetX / TICK_SPACING) + MIN_WEIGHT;
    if (newWeight >= MIN_WEIGHT && newWeight <= MAX_WEIGHT) {
      setGoalWeight(newWeight);
    }
  };

  const handleLayout = () => {
    if (!initialScrollDone.current && scrollRef.current) {
      const initialOffset = (goalWeight - MIN_WEIGHT) * TICK_SPACING;
      scrollRef.current.scrollTo({ x: initialOffset, animated: false });
      initialScrollDone.current = true;
    }
  };

  const handleMomentumEnd = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const snappedWeight = Math.round(offsetX / TICK_SPACING) + MIN_WEIGHT;
    const snappedOffset = (snappedWeight - MIN_WEIGHT) * TICK_SPACING;
    scrollRef.current?.scrollTo({ x: snappedOffset, animated: true });
  };

  return (
    <OnboardingLayout
      progress={8 / 20}
      onBack={() => navigation.goBack()}
      onContinue={() => navigation.navigate('Timeline', { goal, currentWeight, goalWeight })}
    >
      <Text style={styles.title}>What's your goal weight?</Text>
      <Text style={styles.subtitle}>
        This will be used to calibrate your custom calories and macros.
      </Text>

      <View style={styles.labelBadge}>
        <Text style={styles.labelText}>{label}</Text>
      </View>

      <View style={styles.weightDisplay}>
        <Text style={styles.weightValue}>{goalWeight}</Text>
        <Text style={styles.weightUnit}> lbs</Text>
      </View>

      {diff !== 0 && (
        <Text style={[styles.diffText, { color: isGaining ? '#22C55E' : '#EF4444' }]}>
          {isGaining ? '+' : ''}{diff} lbs
        </Text>
      )}

      <View style={styles.sliderContainer}>
        {/* Fixed center indicator */}
        <View style={styles.centerIndicator} />

        {/* Left fade */}
        <View style={styles.fadeLeft} pointerEvents="none">
          <View style={[styles.fadeBlock, { opacity: 1 }]} />
          <View style={[styles.fadeBlock, { opacity: 0.8 }]} />
          <View style={[styles.fadeBlock, { opacity: 0.6 }]} />
          <View style={[styles.fadeBlock, { opacity: 0.4 }]} />
          <View style={[styles.fadeBlock, { opacity: 0.2 }]} />
        </View>

        {/* Right fade */}
        <View style={styles.fadeRight} pointerEvents="none">
          <View style={[styles.fadeBlock, { opacity: 0.2 }]} />
          <View style={[styles.fadeBlock, { opacity: 0.4 }]} />
          <View style={[styles.fadeBlock, { opacity: 0.6 }]} />
          <View style={[styles.fadeBlock, { opacity: 0.8 }]} />
          <View style={[styles.fadeBlock, { opacity: 1 }]} />
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleMomentumEnd}
          scrollEventThrottle={16}
          onLayout={handleLayout}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: CENTER_OFFSET }
          ]}
          decelerationRate="fast"
          snapToInterval={TICK_SPACING}
        >
          {Array.from({ length: TOTAL_TICKS }).map((_, i) => {
            const tickWeight = MIN_WEIGHT + i;
            const isMajor = tickWeight % 10 === 0;
            return (
              <View key={i} style={styles.tickContainer}>
                <View
                  style={[
                    styles.tick,
                    isMajor && styles.tickLarge,
                  ]}
                />
              </View>
            );
          })}
        </ScrollView>
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
    marginBottom: 30,
  },
  labelBadge: {
    alignSelf: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  weightDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  weightValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#000',
  },
  weightUnit: {
    fontSize: 32,
    color: '#000',
  },
  diffText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 40,
  },
  sliderContainer: {
    height: 80,
    position: 'relative',
    marginTop: 20,
  },
  centerIndicator: {
    position: 'absolute',
    left: SCREEN_WIDTH / 2 - 26,
    top: 0,
    width: 3,
    height: 50,
    backgroundColor: '#000',
    borderRadius: 2,
    zIndex: 10,
  },
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 50,
    zIndex: 5,
    flexDirection: 'row',
  },
  fadeRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 50,
    zIndex: 5,
    flexDirection: 'row',
  },
  fadeBlock: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollContent: {
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  tickContainer: {
    width: TICK_SPACING,
    alignItems: 'center',
  },
  tick: {
    width: 1,
    height: 15,
    backgroundColor: '#DDD',
  },
  tickLarge: {
    height: 30,
    backgroundColor: '#CCC',
  },
});
