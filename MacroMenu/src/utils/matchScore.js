/**
 * Match Score Calculator
 * Calculates how well a meal matches user's macro goals and preferences
 */

/**
 * Calculate match score for a meal based on user's targets
 * @param {Object} meal - Meal nutrition data
 * @param {Object} targets - User's per-meal macro targets
 * @param {Object} preferences - User preferences (likes, dislikes, allergies)
 * @returns {Object} Match score and breakdown
 */
export function calculateMatchScore(meal, targets, preferences = {}) {
  const scores = {
    calories: 0,
    protein: 0,
    macroBalance: 0,
    preferences: 0,
  };

  const weights = {
    calories: 0.3,
    protein: 0.35,
    macroBalance: 0.2,
    preferences: 0.15,
  };

  // 1. Calorie Match (30%)
  // Perfect = within 10% of target, good = within 25%
  const calorieDiff = Math.abs(meal.calories - targets.calories);
  const caloriePercentDiff = calorieDiff / targets.calories;

  if (caloriePercentDiff <= 0.1) {
    scores.calories = 100;
  } else if (caloriePercentDiff <= 0.25) {
    scores.calories = 80 - (caloriePercentDiff - 0.1) * 100;
  } else if (caloriePercentDiff <= 0.5) {
    scores.calories = 60 - (caloriePercentDiff - 0.25) * 80;
  } else {
    scores.calories = Math.max(20, 40 - (caloriePercentDiff - 0.5) * 40);
  }

  // 2. Protein Match (35%) - Most important for fitness goals
  const proteinDiff = targets.protein - meal.protein;
  const proteinPercentDiff = Math.abs(proteinDiff) / targets.protein;

  if (proteinDiff <= 0) {
    // Meets or exceeds protein target
    if (proteinPercentDiff <= 0.2) {
      scores.protein = 100;
    } else {
      scores.protein = 90; // Slightly less for way over
    }
  } else if (proteinPercentDiff <= 0.1) {
    scores.protein = 95;
  } else if (proteinPercentDiff <= 0.2) {
    scores.protein = 85;
  } else if (proteinPercentDiff <= 0.3) {
    scores.protein = 70;
  } else {
    scores.protein = Math.max(30, 60 - proteinPercentDiff * 50);
  }

  // 3. Macro Balance (20%)
  // Calculate how balanced the macros are
  const totalCals = meal.protein * 4 + meal.carbs * 4 + meal.fat * 9;
  if (totalCals > 0) {
    const proteinPercent = (meal.protein * 4) / totalCals;
    const carbPercent = (meal.carbs * 4) / totalCals;
    const fatPercent = (meal.fat * 9) / totalCals;

    // Ideal ranges (flexible)
    const proteinIdeal = proteinPercent >= 0.2 && proteinPercent <= 0.4;
    const carbIdeal = carbPercent >= 0.25 && carbPercent <= 0.55;
    const fatIdeal = fatPercent >= 0.2 && fatPercent <= 0.4;

    let balanceScore = 0;
    if (proteinIdeal) balanceScore += 40;
    if (carbIdeal) balanceScore += 30;
    if (fatIdeal) balanceScore += 30;

    scores.macroBalance = balanceScore;
  } else {
    scores.macroBalance = 50;
  }

  // 4. Preference Match (15%)
  scores.preferences = calculatePreferenceScore(meal, preferences);

  // Calculate weighted total
  const totalScore =
    scores.calories * weights.calories +
    scores.protein * weights.protein +
    scores.macroBalance * weights.macroBalance +
    scores.preferences * weights.preferences;

  return {
    score: Math.round(totalScore),
    breakdown: scores,
    rating: getMatchRating(totalScore),
  };
}

/**
 * Calculate preference score based on user likes/dislikes
 */
function calculatePreferenceScore(meal, preferences) {
  const { foodLikes = {}, foodDislikes = {}, allergies = [] } = preferences;

  // Check for allergens - instant disqualification
  if (allergies.length > 0 && meal.allergens) {
    const allergenLower = meal.allergens.toLowerCase();
    for (const allergy of allergies) {
      if (allergenLower.includes(allergy.toLowerCase())) {
        return 0; // Disqualified
      }
    }
  }

  let score = 70; // Base score

  // Check for liked ingredients
  const mealNameLower = (meal.name || '').toLowerCase();
  const allLikes = [
    ...(foodLikes.proteins || []),
    ...(foodLikes.cuisines || []),
    ...(foodLikes.entrees || []),
    ...(foodLikes.flavors || []),
  ];

  for (const like of allLikes) {
    if (mealNameLower.includes(like.toLowerCase())) {
      score += 10;
    }
  }

  // Check for disliked ingredients
  const allDislikes = [
    ...(foodDislikes.proteins || []),
    ...(foodDislikes.cuisines || []),
    ...(foodDislikes.entrees || []),
    ...(foodDislikes.flavors || []),
  ];

  for (const dislike of allDislikes) {
    if (mealNameLower.includes(dislike.toLowerCase())) {
      score -= 20;
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * Get rating label based on score
 */
function getMatchRating(score) {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'great';
  if (score >= 70) return 'good';
  if (score >= 60) return 'okay';
  return 'poor';
}

/**
 * Sort and filter meals by match score
 */
export function rankMeals(meals, targets, preferences = {}, minScore = 50) {
  const rankedMeals = meals
    .map((meal) => {
      const matchResult = calculateMatchScore(meal, targets, preferences);
      return {
        ...meal,
        matchScore: matchResult.score,
        matchRating: matchResult.rating,
        matchBreakdown: matchResult.breakdown,
      };
    })
    .filter((meal) => meal.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore);

  return rankedMeals;
}

/**
 * Get top meal recommendations
 */
export function getTopRecommendations(meals, targets, preferences = {}, limit = 10) {
  const ranked = rankMeals(meals, targets, preferences, 60);
  return ranked.slice(0, limit);
}

/**
 * Calculate how a meal fits into remaining daily macros
 */
export function calculateDailyFit(meal, remainingMacros) {
  const afterMeal = {
    calories: remainingMacros.calories - meal.calories,
    protein: remainingMacros.protein - meal.protein,
    carbs: remainingMacros.carbs - meal.carbs,
    fat: remainingMacros.fat - meal.fat,
  };

  const isOverCalories = afterMeal.calories < 0;
  const meetsProtein = meal.protein >= remainingMacros.protein * 0.3;

  return {
    remaining: afterMeal,
    isOverCalories,
    meetsProtein,
    percentOfDaily: {
      calories: Math.round((meal.calories / (remainingMacros.calories + meal.calories)) * 100),
      protein: Math.round((meal.protein / (remainingMacros.protein + meal.protein)) * 100),
    },
  };
}
