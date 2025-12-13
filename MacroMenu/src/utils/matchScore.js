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

  // Track reasons for score adjustments
  const reasons = {
    positive: [],
    negative: [],
  };

  // 1. Calorie Match (30%)
  // More generous: Perfect = within 20% of target, good = within 35%
  const calorieDiff = meal.calories - targets.calories;
  const caloriePercentDiff = Math.abs(calorieDiff) / targets.calories;

  if (caloriePercentDiff <= 0.20) {
    scores.calories = 100;
    reasons.positive.push('Fits your calorie target');
  } else if (caloriePercentDiff <= 0.35) {
    scores.calories = 85 - (caloriePercentDiff - 0.2) * 50;
    // Only show negative for significant differences
    if (caloriePercentDiff > 0.3) {
      if (calorieDiff > 0) {
        reasons.negative.push(`${Math.round(caloriePercentDiff * 100)}% over calorie target`);
      } else {
        reasons.negative.push(`${Math.round(caloriePercentDiff * 100)}% under calorie target`);
      }
    }
  } else if (caloriePercentDiff <= 0.5) {
    scores.calories = 70 - (caloriePercentDiff - 0.35) * 60;
    if (calorieDiff > 0) {
      reasons.negative.push(`${Math.round(caloriePercentDiff * 100)}% over calorie target`);
    } else {
      reasons.negative.push(`${Math.round(caloriePercentDiff * 100)}% under calorie target`);
    }
  } else {
    scores.calories = Math.max(40, 60 - (caloriePercentDiff - 0.5) * 40);
    if (calorieDiff > 0) {
      reasons.negative.push('Higher calorie option');
    } else {
      reasons.negative.push('Lower calorie option');
    }
  }

  // 2. Protein Match (35%) - Most important for fitness goals
  // More generous: reward meeting target, be lenient on shortfalls
  const proteinDiff = targets.protein - meal.protein;
  const proteinPercentDiff = Math.abs(proteinDiff) / targets.protein;

  if (proteinDiff <= 0) {
    // Meets or exceeds protein target - always great!
    scores.protein = 100;
    reasons.positive.push(`${meal.protein}g protein - hits your target`);
  } else if (proteinPercentDiff <= 0.15) {
    // Within 15% of target - still excellent
    scores.protein = 95;
    reasons.positive.push(`${meal.protein}g protein - close to target`);
  } else if (proteinPercentDiff <= 0.25) {
    // Within 25% - good
    scores.protein = 85;
    reasons.positive.push(`${meal.protein}g protein`);
  } else if (proteinPercentDiff <= 0.4) {
    // Within 40% - okay
    scores.protein = 70;
    // Only show negative for significant shortfalls
    if (proteinPercentDiff > 0.35) {
      reasons.negative.push(`${meal.protein}g protein (below target)`);
    }
  } else {
    scores.protein = Math.max(45, 65 - proteinPercentDiff * 40);
    reasons.negative.push(`Lower protein (${meal.protein}g)`);
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

    if (balanceScore >= 80) {
      reasons.positive.push('Well-balanced macros');
    } else if (fatPercent > 0.45) {
      reasons.negative.push('High in fat');
    } else if (carbPercent > 0.6) {
      reasons.negative.push('High in carbs');
    }
  } else {
    scores.macroBalance = 50;
  }

  // 4. Preference Match (15%)
  const prefResult = calculatePreferenceScore(meal, preferences);
  scores.preferences = prefResult.score;
  const matchInfo = prefResult.matchInfo;

  // Add preference-based reasons
  if (matchInfo.matchedLikes.length > 0) {
    reasons.positive.push(`Has ${matchInfo.matchedLikes[0]} you like`);
  }
  if (matchInfo.matchedDislikes.length > 0) {
    reasons.negative.push(`Contains ${matchInfo.matchedDislikes[0]} (not your style)`);
  }

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
    reasons,
    matchInfo,
  };
}

/**
 * Calculate preference score based on user likes/dislikes
 * Returns both score and detailed match info for contextual labels
 */
function calculatePreferenceScore(meal, preferences) {
  const { foodLikes = {}, foodDislikes = {}, allergies = [] } = preferences;

  const matchInfo = {
    matchedLikes: [],
    matchedDislikes: [],
    hasAllergen: false,
    allergenTriggered: null,
  };

  // Check for allergens - instant disqualification
  if (allergies.length > 0 && meal.allergens) {
    const allergenLower = meal.allergens.toLowerCase();
    for (const allergy of allergies) {
      // Map common allergy names to ingredients
      const allergyMapping = {
        'dairy': ['dairy', 'milk', 'cheese', 'cream', 'butter'],
        'gluten': ['gluten', 'wheat', 'bread', 'bun'],
        'peanut': ['peanut', 'peanuts'],
        'tree nuts': ['almond', 'cashew', 'walnut', 'nuts'],
        'shellfish': ['shrimp', 'crab', 'lobster', 'shellfish'],
        'fish': ['fish', 'salmon', 'tuna'],
        'egg': ['egg', 'eggs'],
        'soy': ['soy', 'tofu', 'sofritas'],
        'sesame': ['sesame', 'tahini'],
      };

      const allergyLower = allergy.toLowerCase();
      const allergenKeywords = allergyMapping[allergyLower] || [allergyLower];

      for (const keyword of allergenKeywords) {
        if (allergenLower.includes(keyword)) {
          matchInfo.hasAllergen = true;
          matchInfo.allergenTriggered = allergy;
          return { score: 0, matchInfo }; // Disqualified
        }
      }
    }
  }

  let score = 80; // Base score (increased from 70 for more generous scoring)

  // Combine meal name, description, and tags for matching
  const mealNameLower = (meal.name || '').toLowerCase();
  const mealDescLower = (meal.description || '').toLowerCase();
  const mealTagsLower = (meal.tags || []).join(' ').toLowerCase();
  const mealText = `${mealNameLower} ${mealDescLower} ${mealTagsLower}`;

  // Check for liked ingredients - boost score for matches
  const allLikes = [
    ...(foodLikes.proteins || []),
    ...(foodLikes.cuisines || []),
    ...(foodLikes.entrees || []),
    ...(foodLikes.sides || []),
    ...(foodLikes.flavors || []),
  ];

  for (const like of allLikes) {
    const likeLower = like.toLowerCase();
    if (mealText.includes(likeLower)) {
      score += 10;
      matchInfo.matchedLikes.push(like);
    }
  }

  // Check for disliked ingredients - smaller penalty (10 instead of 20)
  const allDislikes = [
    ...(foodDislikes.proteins || []),
    ...(foodDislikes.cuisines || []),
    ...(foodDislikes.entrees || []),
    ...(foodDislikes.sides || []),
    ...(foodDislikes.flavors || []),
  ];

  for (const dislike of allDislikes) {
    const dislikeLower = dislike.toLowerCase();
    if (mealText.includes(dislikeLower)) {
      score -= 10; // Reduced from -20 for more generous scoring
      matchInfo.matchedDislikes.push(dislike);
    }
  }

  return { score: Math.max(0, Math.min(100, score)), matchInfo };
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
