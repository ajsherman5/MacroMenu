/**
 * AI Menu Analysis Service
 *
 * Uses AI to analyze local restaurant menus and estimate nutrition.
 * This enables MacroMenu to work with ANY restaurant, not just chains.
 *
 * Flow:
 * 1. Fetch menu from Google Places or user input
 * 2. Send to AI for analysis
 * 3. AI estimates macros based on dish names, descriptions, ingredients
 * 4. Return structured data with "estimated" flag
 */

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Check if AI analysis is available
export const isAIAnalysisConfigured = () => {
  return !!ANTHROPIC_API_KEY && ANTHROPIC_API_KEY !== 'your_api_key';
};

/**
 * Analyze a restaurant menu and estimate nutrition for each item
 * @param {string} restaurantName - Name of the restaurant
 * @param {string} cuisineType - Type of cuisine (e.g., "Italian", "Mexican", "American")
 * @param {Array} menuItems - Array of menu item names/descriptions
 * @param {Object} userGoal - User's fitness goal context
 * @returns {Promise<Array>} Analyzed menu items with estimated nutrition
 */
export async function analyzeMenu(restaurantName, cuisineType, menuItems, userGoal = {}) {
  // If no API key, use estimation based on dish type
  if (!isAIAnalysisConfigured()) {
    console.log('AI not configured, using rule-based estimation');
    return estimateMenuNutrition(menuItems, cuisineType);
  }

  try {
    const prompt = buildAnalysisPrompt(restaurantName, cuisineType, menuItems, userGoal);

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    if (data.content && data.content[0]) {
      return parseAIResponse(data.content[0].text, menuItems);
    }

    // Fallback to rule-based estimation
    return estimateMenuNutrition(menuItems, cuisineType);
  } catch (error) {
    console.error('AI analysis error:', error);
    return estimateMenuNutrition(menuItems, cuisineType);
  }
}

/**
 * Build the prompt for AI menu analysis
 */
function buildAnalysisPrompt(restaurantName, cuisineType, menuItems, userGoal) {
  const goalContext = userGoal.goal === 'bulk'
    ? 'high protein for muscle building'
    : userGoal.goal === 'cut'
    ? 'lower calorie for fat loss'
    : 'balanced macros for maintenance';

  return `You are a nutrition expert. Analyze these menu items from "${restaurantName}" (${cuisineType || 'American'} cuisine) and estimate the nutrition for each.

Menu items to analyze:
${menuItems.map((item, i) => `${i + 1}. ${typeof item === 'string' ? item : item.name + (item.description ? ': ' + item.description : '')}`).join('\n')}

For each item, provide:
1. Estimated calories
2. Estimated protein (grams)
3. Estimated carbs (grams)
4. Estimated fat (grams)
5. A brief insight (1 sentence) about how this fits someone focused on ${goalContext}

Respond in JSON format only:
{
  "items": [
    {
      "name": "Item name",
      "calories": 500,
      "protein": 30,
      "carbs": 40,
      "fat": 20,
      "insight": "Brief insight about the dish"
    }
  ]
}

Base estimates on typical restaurant portion sizes. Be realistic - restaurant portions are usually larger than home-cooked meals.`;
}

/**
 * Parse AI response into structured menu items
 */
function parseAIResponse(responseText, originalItems) {
  try {
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return (parsed.items || []).map((item, index) => ({
      id: `ai-${Date.now()}-${index}`,
      name: item.name || originalItems[index]?.name || `Item ${index + 1}`,
      calories: item.calories || 0,
      protein: item.protein || 0,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      insight: item.insight || '',
      isEstimated: true,
      source: 'ai',
    }));
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return estimateMenuNutrition(originalItems, 'American');
  }
}

/**
 * Rule-based nutrition estimation (fallback when AI unavailable)
 * Uses dish name patterns to estimate macros
 */
export function estimateMenuNutrition(menuItems, cuisineType = 'American') {
  return menuItems.map((item, index) => {
    const name = typeof item === 'string' ? item : item.name;
    const description = typeof item === 'string' ? '' : (item.description || '');
    const fullText = `${name} ${description}`.toLowerCase();

    const estimate = estimateSingleItem(fullText, cuisineType);

    return {
      id: `est-${Date.now()}-${index}`,
      name: name,
      description: description,
      calories: estimate.calories,
      protein: estimate.protein,
      carbs: estimate.carbs,
      fat: estimate.fat,
      insight: estimate.insight,
      isEstimated: true,
      source: 'rules',
    };
  });
}

/**
 * Estimate nutrition for a single menu item based on keywords
 */
function estimateSingleItem(text, cuisineType) {
  let base = { calories: 600, protein: 25, carbs: 50, fat: 25 };
  let insight = 'A balanced restaurant meal.';

  // Protein indicators
  if (text.includes('chicken') || text.includes('grilled chicken')) {
    base = { calories: 550, protein: 42, carbs: 35, fat: 18 };
    insight = 'Chicken is a lean protein source, great for hitting protein goals.';
  } else if (text.includes('steak') || text.includes('sirloin') || text.includes('ribeye') || text.includes('filet')) {
    base = { calories: 650, protein: 52, carbs: 15, fat: 35 };
    insight = 'Steak delivers high protein, perfect for muscle building.';
  } else if (text.includes('salmon') || text.includes('fish') || text.includes('seafood')) {
    base = { calories: 500, protein: 38, carbs: 20, fat: 25 };
    insight = 'Fish provides protein plus healthy omega-3 fats.';
  } else if (text.includes('shrimp')) {
    base = { calories: 400, protein: 35, carbs: 25, fat: 15 };
    insight = 'Shrimp is very low calorie with solid protein.';
  } else if (text.includes('burger') || text.includes('patty')) {
    base = { calories: 750, protein: 35, carbs: 45, fat: 45 };
    insight = 'Burgers are calorie-dense; good for bulking, watch portions for cutting.';
  }

  // Dish type modifiers
  if (text.includes('salad') && !text.includes('pasta salad')) {
    base.calories = Math.round(base.calories * 0.7);
    base.carbs = Math.round(base.carbs * 0.5);
    insight = 'Salads are typically lower calorie. Watch out for heavy dressings.';
  } else if (text.includes('fried') || text.includes('crispy') || text.includes('breaded')) {
    base.calories = Math.round(base.calories * 1.3);
    base.fat = Math.round(base.fat * 1.5);
    insight = 'Fried foods add significant calories from oil.';
  } else if (text.includes('bowl') || text.includes('rice bowl')) {
    base.carbs = Math.round(base.carbs * 1.3);
    insight = 'Bowls often have good macro balance with protein, carbs, and veggies.';
  } else if (text.includes('wrap') || text.includes('burrito')) {
    base.carbs = Math.round(base.carbs * 1.2);
    insight = 'Wraps can be a good balanced option depending on fillings.';
  } else if (text.includes('pasta') || text.includes('spaghetti') || text.includes('fettuccine')) {
    base = { calories: 800, protein: 25, carbs: 95, fat: 30 };
    insight = 'Pasta is carb-heavy. Ask for extra protein or go half portion for cutting.';
  } else if (text.includes('pizza')) {
    base = { calories: 700, protein: 28, carbs: 75, fat: 32 };
    insight = 'Pizza varies widely. Thin crust with lean toppings is better for macros.';
  }

  // Cuisine adjustments
  if (cuisineType) {
    const cuisine = cuisineType.toLowerCase();
    if (cuisine.includes('mexican')) {
      base.carbs = Math.round(base.carbs * 1.1);
      base.fat = Math.round(base.fat * 1.1);
    } else if (cuisine.includes('italian')) {
      base.carbs = Math.round(base.carbs * 1.2);
    } else if (cuisine.includes('asian') || cuisine.includes('chinese') || cuisine.includes('thai')) {
      base.carbs = Math.round(base.carbs * 1.15);
    } else if (cuisine.includes('indian')) {
      base.fat = Math.round(base.fat * 1.2);
    } else if (cuisine.includes('mediterranean') || cuisine.includes('greek')) {
      // Generally healthier
      base.calories = Math.round(base.calories * 0.9);
    }
  }

  // Size modifiers
  if (text.includes('large') || text.includes('xl') || text.includes('double')) {
    base.calories = Math.round(base.calories * 1.4);
    base.protein = Math.round(base.protein * 1.3);
    base.carbs = Math.round(base.carbs * 1.4);
    base.fat = Math.round(base.fat * 1.4);
  } else if (text.includes('small') || text.includes('petite') || text.includes('lunch')) {
    base.calories = Math.round(base.calories * 0.7);
    base.protein = Math.round(base.protein * 0.7);
    base.carbs = Math.round(base.carbs * 0.7);
    base.fat = Math.round(base.fat * 0.7);
  }

  // Side dishes
  if (text.includes('fries') || text.includes('french fries')) {
    base.calories += 350;
    base.carbs += 45;
    base.fat += 17;
  } else if (text.includes('vegetable') || text.includes('veggie') || text.includes('steamed')) {
    base.calories += 80;
    base.carbs += 15;
    insight = 'Vegetables add nutrients with minimal calories.';
  } else if (text.includes('mashed potato') || text.includes('baked potato')) {
    base.calories += 250;
    base.carbs += 40;
  }

  return { ...base, insight };
}

/**
 * Generate a meal recommendation insight
 */
export function generateMealInsight(meal, userGoal) {
  const { calories, protein, carbs, fat } = meal;
  const goal = userGoal?.goal || 'maintain';

  const proteinPerCal = protein / (calories / 100);

  if (goal === 'bulk') {
    if (protein >= 40 && calories >= 600) {
      return `Great bulking choice with ${protein}g protein. This will help fuel muscle growth.`;
    } else if (protein >= 40) {
      return `Solid protein at ${protein}g. Consider adding a side to boost calories for bulking.`;
    } else {
      return `Moderate protein. Ask for extra meat or a protein side to optimize for muscle building.`;
    }
  } else if (goal === 'cut') {
    if (calories <= 500 && protein >= 30) {
      return `Excellent cutting option - high protein (${protein}g) at only ${calories} calories.`;
    } else if (calories <= 600) {
      return `Reasonable for cutting at ${calories} cal. Prioritize the protein and skip heavy sauces.`;
    } else {
      return `Higher calorie option (${calories} cal). Ask for dressing on side or skip the bread to reduce.`;
    }
  } else {
    if (proteinPerCal >= 0.07) {
      return `Well-balanced with good protein density. A solid choice for maintaining.`;
    } else {
      return `Balanced macros. Add a side salad or veggies to round out the meal.`;
    }
  }
}

/**
 * Fetch menu from Google Places (placeholder - needs Places Details API)
 */
export async function fetchMenuFromGoogle(placeId) {
  // TODO: Implement Google Places menu fetching
  // This requires the Places Details API with menu data
  // For now, return null to trigger manual input
  console.log('Menu fetching not yet implemented for place:', placeId);
  return null;
}

export default {
  isAIAnalysisConfigured,
  analyzeMenu,
  estimateMenuNutrition,
  generateMealInsight,
  fetchMenuFromGoogle,
};
