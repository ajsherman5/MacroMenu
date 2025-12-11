/**
 * Macro Calculator - Calculate TDEE and macro targets based on user profile
 */

// Activity level multipliers for TDEE calculation
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2, // No activity
  light: 1.375, // 1-2x/week
  moderate: 1.55, // 3-4x/week
  active: 1.725, // 5+ x/week
  'very-active': 1.9, // Athlete, physical job
};

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor equation
 * @param {Object} params
 * @param {string} params.gender - 'male', 'female', or 'other'
 * @param {number} params.weight - Weight in pounds
 * @param {number} params.height - Height in inches
 * @param {number} params.age - Age in years (default: 30)
 */
export function calculateBMR({ gender, weight, height, age = 30 }) {
  // Convert to metric
  const weightKg = weight * 0.453592;
  const heightCm = height * 2.54;

  // Mifflin-St Jeor equation
  if (gender === 'male') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else if (gender === 'female') {
    return 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  } else {
    // For 'other', use average
    const maleBMR = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
    const femaleBMR = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
    return (maleBMR + femaleBMR) / 2;
  }
}

/**
 * Calculate Total Daily Energy Expenditure (TDEE)
 */
export function calculateTDEE({ gender, weight, height, age = 30, activityLevel }) {
  const bmr = calculateBMR({ gender, weight, height, age });
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.55;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate daily calorie target based on goal
 * @param {Object} params
 * @param {number} params.tdee - Total Daily Energy Expenditure
 * @param {string} params.goal - 'bulk', 'cut', or 'maintain'
 * @param {number} params.currentWeight - Current weight in pounds
 * @param {number} params.goalWeight - Goal weight in pounds
 * @param {number} params.timeline - Weeks to reach goal
 */
export function calculateDailyCalories({ tdee, goal, currentWeight, goalWeight, timeline }) {
  if (goal === 'maintain') {
    return tdee;
  }

  const weightDiff = Math.abs(goalWeight - currentWeight);
  const weeks = parseInt(timeline) || 12;

  // 1 pound = ~3500 calories
  // Calculate weekly calorie adjustment
  const weeklyCalorieAdjustment = (weightDiff * 3500) / weeks;
  const dailyCalorieAdjustment = weeklyCalorieAdjustment / 7;

  if (goal === 'bulk') {
    // Surplus for bulking (cap at 500 cal/day surplus for healthy gain)
    return Math.round(tdee + Math.min(dailyCalorieAdjustment, 500));
  } else if (goal === 'cut') {
    // Deficit for cutting (cap at 750 cal/day deficit for safe loss)
    return Math.round(tdee - Math.min(dailyCalorieAdjustment, 750));
  }

  return tdee;
}

/**
 * Calculate macro targets based on goal and calories
 * @param {Object} params
 * @param {number} params.calories - Daily calorie target
 * @param {string} params.goal - 'bulk', 'cut', or 'maintain'
 * @param {number} params.weight - Current weight in pounds
 * @param {string} params.eatingStyle - 'none', 'keto', 'vegan', etc.
 */
export function calculateMacros({ calories, goal, weight, eatingStyle = 'none' }) {
  let proteinRatio, carbRatio, fatRatio;

  // Protein: 0.8-1.2g per lb body weight depending on goal
  let proteinPerLb;

  if (goal === 'bulk') {
    proteinPerLb = 1.0; // 1g per lb for muscle building
    proteinRatio = 0.3;
    carbRatio = 0.45;
    fatRatio = 0.25;
  } else if (goal === 'cut') {
    proteinPerLb = 1.2; // Higher protein for muscle preservation
    proteinRatio = 0.35;
    carbRatio = 0.35;
    fatRatio = 0.3;
  } else {
    // maintain
    proteinPerLb = 0.8;
    proteinRatio = 0.25;
    carbRatio = 0.45;
    fatRatio = 0.3;
  }

  // Adjust for eating style
  if (eatingStyle === 'keto') {
    proteinRatio = 0.25;
    carbRatio = 0.05; // Very low carb
    fatRatio = 0.7;
  } else if (eatingStyle === 'carnivore') {
    proteinRatio = 0.35;
    carbRatio = 0.0;
    fatRatio = 0.65;
  }

  // Calculate grams
  // Protein: 4 cal/g, Carbs: 4 cal/g, Fat: 9 cal/g
  const proteinGrams = Math.round(Math.max(weight * proteinPerLb, (calories * proteinRatio) / 4));
  const fatGrams = Math.round((calories * fatRatio) / 9);
  const carbGrams = Math.round((calories - proteinGrams * 4 - fatGrams * 9) / 4);

  return {
    protein: Math.max(0, proteinGrams),
    carbs: Math.max(0, carbGrams),
    fat: Math.max(0, fatGrams),
    calories,
  };
}

/**
 * Calculate per-meal macro targets
 * @param {Object} macros - Daily macro targets
 * @param {number} mealsPerDay - Number of meals (default: 3)
 */
export function calculatePerMealMacros(macros, mealsPerDay = 3) {
  return {
    calories: Math.round(macros.calories / mealsPerDay),
    protein: Math.round(macros.protein / mealsPerDay),
    carbs: Math.round(macros.carbs / mealsPerDay),
    fat: Math.round(macros.fat / mealsPerDay),
  };
}

/**
 * Calculate all macro targets from user profile
 */
export function calculateUserMacros(userProfile) {
  const {
    gender,
    height,
    currentWeight,
    goalWeight,
    goal,
    activityLevel,
    timeline,
    eatingStyle,
  } = userProfile;

  // Calculate TDEE
  const tdee = calculateTDEE({
    gender,
    weight: currentWeight,
    height,
    activityLevel,
  });

  // Calculate daily calories
  const dailyCalories = calculateDailyCalories({
    tdee,
    goal,
    currentWeight,
    goalWeight: goalWeight || currentWeight,
    timeline: timeline || '12',
  });

  // Calculate macros
  const macros = calculateMacros({
    calories: dailyCalories,
    goal,
    weight: currentWeight,
    eatingStyle,
  });

  // Calculate per-meal targets
  const perMeal = calculatePerMealMacros(macros);

  return {
    daily: macros,
    perMeal,
    tdee,
  };
}
