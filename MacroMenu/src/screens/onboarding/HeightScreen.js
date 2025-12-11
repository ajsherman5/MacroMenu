import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import OnboardingLayout from '../../components/OnboardingLayout';
import { useOnboarding } from '../../context';

const ITEM_HEIGHT = 50;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const feet = [3, 4, 5, 6, 7, 8];
const inches = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const cmValues = Array.from({ length: 121 }, (_, i) => 100 + i); // 100cm to 220cm

export default function HeightScreen({ navigation, route }) {
  const goal = route.params?.goal;
  const [useCm, setUseCm] = useState(false);
  const [selectedFeet, setSelectedFeet] = useState(5);
  const [selectedInches, setSelectedInches] = useState(10);
  const [selectedCm, setSelectedCm] = useState(178);
  const [isReady, setIsReady] = useState(false);
  const { updateOnboarding } = useOnboarding();

  const handleContinue = () => {
    // Store height in inches for consistency
    const heightInInches = useCm
      ? Math.round(selectedCm / 2.54)
      : (selectedFeet * 12) + selectedInches;
    updateOnboarding({ height: heightInInches });
    navigation.navigate('Weight', { goal });
  };

  const feetScrollRef = useRef(null);
  const inchesScrollRef = useRef(null);
  const cmScrollRef = useRef(null);

  // Scroll to initial positions on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const feetIndex = feet.indexOf(selectedFeet);
      const inchesIndex = inches.indexOf(selectedInches);
      const cmIndex = cmValues.indexOf(selectedCm);

      if (feetScrollRef.current && feetIndex >= 0) {
        feetScrollRef.current.scrollTo({ y: feetIndex * ITEM_HEIGHT, animated: false });
      }
      if (inchesScrollRef.current && inchesIndex >= 0) {
        inchesScrollRef.current.scrollTo({ y: inchesIndex * ITEM_HEIGHT, animated: false });
      }
      if (cmScrollRef.current && cmIndex >= 0) {
        cmScrollRef.current.scrollTo({ y: cmIndex * ITEM_HEIGHT, animated: false });
      }
      setIsReady(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleFeetScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (index >= 0 && index < feet.length) {
      setSelectedFeet(feet[index]);
    }
  };

  const handleInchesScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (index >= 0 && index < inches.length) {
      setSelectedInches(inches[index]);
    }
  };

  const handleCmScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    if (index >= 0 && index < cmValues.length) {
      setSelectedCm(cmValues[index]);
    }
  };

  const renderPickerItems = (items, selected, suffix) => {
    const paddingItems = Math.floor(VISIBLE_ITEMS / 2);
    return (
      <>
        {Array(paddingItems).fill(null).map((_, i) => (
          <View key={`pad-start-${i}`} style={styles.pickerItem} />
        ))}
        {items.map((item) => (
          <View key={item} style={styles.pickerItem}>
            <Text style={[
              styles.pickerText,
              isReady && item === selected && styles.pickerTextSelected
            ]}>
              {item} {suffix}
            </Text>
          </View>
        ))}
        {Array(paddingItems).fill(null).map((_, i) => (
          <View key={`pad-end-${i}`} style={styles.pickerItem} />
        ))}
      </>
    );
  };

  return (
    <OnboardingLayout
      progress={6 / 20}
      onBack={() => navigation.goBack()}
      onContinue={handleContinue}
    >
      <Text style={styles.title}>Tell us about you</Text>
      <Text style={styles.subtitle}>
        This will be used to calibrate your custom calories and macros.
      </Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, !useCm && styles.toggleButtonActive]}
          onPress={() => setUseCm(false)}
        >
          <Text style={[styles.toggleText, !useCm && styles.toggleTextActive]}>ft / in</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, useCm && styles.toggleButtonActive]}
          onPress={() => setUseCm(true)}
        >
          <Text style={[styles.toggleText, useCm && styles.toggleTextActive]}>cm</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Height</Text>

      <View style={styles.pickerContainer}>
        {!useCm ? (
          <View style={styles.dualPicker}>
            <View style={styles.pickerWrapper}>
              <ScrollView
                ref={feetScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={handleFeetScroll}
                contentContainerStyle={styles.pickerContent}
              >
                {renderPickerItems(feet, selectedFeet, 'ft')}
              </ScrollView>
            </View>
            <View style={styles.pickerWrapper}>
              <ScrollView
                ref={inchesScrollRef}
                showsVerticalScrollIndicator={false}
                snapToInterval={ITEM_HEIGHT}
                decelerationRate="fast"
                onMomentumScrollEnd={handleInchesScroll}
                contentContainerStyle={styles.pickerContent}
              >
                {renderPickerItems(inches, selectedInches, 'in')}
              </ScrollView>
            </View>
          </View>
        ) : (
          <View style={styles.singlePicker}>
            <ScrollView
              ref={cmScrollRef}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={handleCmScroll}
              contentContainerStyle={styles.pickerContent}
            >
              {renderPickerItems(cmValues, selectedCm, 'cm')}
            </ScrollView>
          </View>
        )}
        <View style={styles.selectionIndicator} pointerEvents="none" />
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#EFEFEF',
    borderRadius: 25,
    padding: 4,
    alignSelf: 'center',
    marginBottom: 40,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  toggleButtonActive: {
    backgroundColor: '#fff',
  },
  toggleText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    height: PICKER_HEIGHT,
    position: 'relative',
  },
  dualPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  singlePicker: {
    alignItems: 'center',
  },
  pickerWrapper: {
    width: 100,
    height: PICKER_HEIGHT,
    overflow: 'hidden',
  },
  pickerContent: {
    alignItems: 'center',
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 20,
    color: '#CCC',
  },
  pickerTextSelected: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },
});
