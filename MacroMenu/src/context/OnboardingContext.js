import React, { createContext, useContext, useState } from 'react';

const OnboardingContext = createContext();

// Temporary storage during onboarding flow
// This data gets transferred to UserContext when onboarding completes
const defaultOnboarding = {
  // Goal & Lifestyle
  goal: null, // 'bulk', 'cut', 'maintain'
  daysEatingOut: null,
  hardestPart: null,
  howDecide: null,

  // Physical Stats
  gender: null,
  height: null, // in inches
  currentWeight: null,
  goalWeight: null,
  timeline: null,
  activityLevel: null,
  eatingStyle: null,

  // Preferences
  favoriteRestaurants: [],
  foodLikes: {
    cuisines: [],
    entrees: [],
    proteins: [],
    sides: [],
    flavors: [],
  },
  foodDislikes: {
    cuisines: [],
    entrees: [],
    proteins: [],
    sides: [],
    flavors: [],
  },

  // Restrictions
  allergies: [],
  dietaryPreferences: [],
};

export function OnboardingProvider({ children }) {
  const [onboarding, setOnboarding] = useState(defaultOnboarding);

  const updateOnboarding = (data) => {
    setOnboarding((prev) => ({ ...prev, ...data }));
  };

  const updateFoodLikes = (category, items) => {
    setOnboarding((prev) => ({
      ...prev,
      foodLikes: { ...prev.foodLikes, [category]: items },
    }));
  };

  const updateFoodDislikes = (category, items) => {
    setOnboarding((prev) => ({
      ...prev,
      foodDislikes: { ...prev.foodDislikes, [category]: items },
    }));
  };

  const resetOnboarding = () => {
    setOnboarding(defaultOnboarding);
  };

  // Get all onboarding data for transfer to UserContext
  const getOnboardingData = () => onboarding;

  return (
    <OnboardingContext.Provider
      value={{
        onboarding,
        updateOnboarding,
        updateFoodLikes,
        updateFoodDislikes,
        resetOnboarding,
        getOnboardingData,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
