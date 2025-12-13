/**
 * FatSecret API Service
 * Used for nutrition data (calories, protein, carbs, fat)
 *
 * Free tier: 5,000 calls/day
 * Premier tier (free for startups): Full access
 *
 * Setup:
 * 1. Go to https://platform.fatsecret.com/
 * 2. Create developer account
 * 3. Create an app to get Client ID and Client Secret
 * 4. Add to .env:
 *    EXPO_PUBLIC_FATSECRET_CLIENT_ID=your_client_id
 *    EXPO_PUBLIC_FATSECRET_CLIENT_SECRET=your_client_secret
 */

const CLIENT_ID = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_SECRET;
const TOKEN_URL = 'https://oauth.fatsecret.com/connect/token';
const API_BASE_URL = 'https://platform.fatsecret.com/rest/server.api';

// Cache for access token
let accessToken = null;
let tokenExpiry = null;

// Cache for API responses (reduces API calls)
const responseCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Check if API is configured
export const isFatSecretConfigured = () => {
  return !!CLIENT_ID && !!CLIENT_SECRET &&
    CLIENT_ID !== 'your_client_id' &&
    CLIENT_SECRET !== 'your_client_secret';
};

/**
 * Base64 encode for React Native (btoa polyfill)
 */
function base64Encode(str) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let i = 0; i < str.length; i += 3) {
    const char1 = str.charCodeAt(i);
    const char2 = str.charCodeAt(i + 1);
    const char3 = str.charCodeAt(i + 2);
    const enc1 = char1 >> 2;
    const enc2 = ((char1 & 3) << 4) | (char2 >> 4);
    const enc3 = isNaN(char2) ? 64 : ((char2 & 15) << 2) | (char3 >> 6);
    const enc4 = isNaN(char3) ? 64 : char3 & 63;
    output += chars.charAt(enc1) + chars.charAt(enc2) + chars.charAt(enc3) + chars.charAt(enc4);
  }
  return output;
}

/**
 * Get OAuth2 access token
 */
async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('Using cached FatSecret token');
    return accessToken;
  }

  console.log('Fetching new FatSecret access token...');

  try {
    const credentials = base64Encode(`${CLIENT_ID}:${CLIENT_SECRET}`);

    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=basic',
    });

    const data = await response.json();
    console.log('FatSecret token response:', data.access_token ? 'Token received' : data);

    if (data.access_token) {
      accessToken = data.access_token;
      // Set expiry 5 minutes before actual expiry for safety
      tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;
      return accessToken;
    }

    console.error('FatSecret auth failed:', data);
    throw new Error('Failed to get access token');
  } catch (error) {
    console.error('FatSecret auth error:', error);
    return null;
  }
}

/**
 * Make authenticated API request
 */
async function apiRequest(method, params = {}) {
  const token = await getAccessToken();

  if (!token) {
    console.warn('FatSecret API not authenticated');
    return null;
  }

  // Check cache
  const cacheKey = `${method}-${JSON.stringify(params)}`;
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const searchParams = new URLSearchParams({
      method,
      format: 'json',
      ...params,
    });

    const response = await fetch(`${API_BASE_URL}?${searchParams}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Cache the response
    responseCache.set(cacheKey, { data, timestamp: Date.now() });

    return data;
  } catch (error) {
    console.error('FatSecret API error:', error);
    return null;
  }
}

/**
 * Search for foods by name
 * @param {string} query - Search query (e.g., "chicken burrito")
 * @param {number} maxResults - Max number of results
 * @returns {Promise<Array>} List of foods
 */
export async function searchFoods(query, maxResults = 20) {
  if (!isFatSecretConfigured()) {
    console.warn('FatSecret API not configured, returning mock data');
    return getMockSearchResults(query);
  }

  const data = await apiRequest('foods.search', {
    search_expression: query,
    max_results: maxResults,
  });

  console.log('FatSecret search response for:', query, data);

  if (!data?.foods?.food) {
    console.log('No foods found in response, falling back to mock data');
    return getMockSearchResults(query);
  }

  // FatSecret returns single item as object, multiple as array
  const foods = Array.isArray(data.foods.food) ? data.foods.food : [data.foods.food];

  return foods.map(transformFoodResult);
}

/**
 * Search for restaurant foods specifically
 * @param {string} restaurantName - Restaurant name (e.g., "Chipotle")
 * @param {string} itemQuery - Optional item query (e.g., "burrito bowl")
 * @returns {Promise<Array>} List of restaurant foods
 */
export async function searchRestaurantFoods(restaurantName, itemQuery = '') {
  const query = itemQuery
    ? `${restaurantName} ${itemQuery}`
    : restaurantName;

  const results = await searchFoods(query, 50);

  console.log('searchRestaurantFoods results count:', results.length);

  // If we got results, try to filter to restaurant-specific items
  if (results.length > 0) {
    const restaurantNormalized = restaurantName.toLowerCase().replace(/[^a-z]/g, '');

    const filtered = results.filter(item => {
      const brandNormalized = (item.brandName || '').toLowerCase().replace(/[^a-z]/g, '');
      const nameNormalized = item.name.toLowerCase().replace(/[^a-z]/g, '');

      return brandNormalized.includes(restaurantNormalized) ||
        nameNormalized.includes(restaurantNormalized);
    });

    console.log('Filtered results count:', filtered.length);

    // If filtering removed everything, return all results
    // (better to show generic items than nothing)
    if (filtered.length > 0) {
      return filtered;
    }

    // Return unfiltered results if no matches
    return results;
  }

  return results;
}

/**
 * Get detailed nutrition info for a food
 * @param {string} foodId - FatSecret food ID
 * @returns {Promise<Object>} Detailed food info
 */
export async function getFoodDetails(foodId) {
  if (!isFatSecretConfigured()) {
    return null;
  }

  const data = await apiRequest('food.get.v2', { food_id: foodId });

  if (!data?.food) {
    return null;
  }

  return transformFoodDetails(data.food);
}

/**
 * Get autocomplete suggestions
 * @param {string} query - Partial search query
 * @returns {Promise<Array>} Autocomplete suggestions
 */
export async function getAutocompleteSuggestions(query) {
  if (!isFatSecretConfigured() || query.length < 2) {
    return [];
  }

  const data = await apiRequest('foods.autocomplete', {
    expression: query,
    max_results: 10,
  });

  if (!data?.suggestions?.suggestion) {
    return [];
  }

  const suggestions = Array.isArray(data.suggestions.suggestion)
    ? data.suggestions.suggestion
    : [data.suggestions.suggestion];

  return suggestions;
}

/**
 * Transform FatSecret food result to our app format
 */
function transformFoodResult(food) {
  // Parse nutrition from description (FatSecret format: "Per 1 serving - Calories: 350kcal | Fat: 12g | Carbs: 45g | Protein: 25g")
  const nutrition = parseNutritionDescription(food.food_description || '');

  return {
    id: food.food_id,
    foodId: food.food_id,
    name: food.food_name,
    brandName: food.brand_name || null,
    type: food.food_type, // 'Brand' or 'Generic'
    description: food.food_description,
    calories: nutrition.calories,
    protein: nutrition.protein,
    carbs: nutrition.carbs,
    fat: nutrition.fat,
    servingSize: nutrition.servingSize,
  };
}

/**
 * Transform detailed food info
 */
function transformFoodDetails(food) {
  const servings = food.servings?.serving;
  const serving = Array.isArray(servings) ? servings[0] : servings;

  return {
    id: food.food_id,
    name: food.food_name,
    brandName: food.brand_name || null,
    type: food.food_type,
    calories: parseFloat(serving?.calories) || 0,
    protein: parseFloat(serving?.protein) || 0,
    carbs: parseFloat(serving?.carbohydrate) || 0,
    fat: parseFloat(serving?.fat) || 0,
    fiber: parseFloat(serving?.fiber) || 0,
    sugar: parseFloat(serving?.sugar) || 0,
    sodium: parseFloat(serving?.sodium) || 0,
    saturatedFat: parseFloat(serving?.saturated_fat) || 0,
    servingSize: serving?.serving_description || '',
    servingUnit: serving?.metric_serving_unit || '',
    servingAmount: parseFloat(serving?.metric_serving_amount) || 0,
  };
}

/**
 * Parse nutrition from FatSecret description string
 */
function parseNutritionDescription(description) {
  const result = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    servingSize: '',
  };

  if (!description) return result;

  // Extract serving size (e.g., "Per 1 serving" or "Per 100g")
  const servingMatch = description.match(/Per\s+([^-]+)/i);
  if (servingMatch) {
    result.servingSize = servingMatch[1].trim();
  }

  // Extract calories
  const caloriesMatch = description.match(/Calories:\s*([\d.]+)/i);
  if (caloriesMatch) {
    result.calories = Math.round(parseFloat(caloriesMatch[1]));
  }

  // Extract fat
  const fatMatch = description.match(/Fat:\s*([\d.]+)/i);
  if (fatMatch) {
    result.fat = Math.round(parseFloat(fatMatch[1]));
  }

  // Extract carbs
  const carbsMatch = description.match(/Carbs:\s*([\d.]+)/i);
  if (carbsMatch) {
    result.carbs = Math.round(parseFloat(carbsMatch[1]));
  }

  // Extract protein
  const proteinMatch = description.match(/Protein:\s*([\d.]+)/i);
  if (proteinMatch) {
    result.protein = Math.round(parseFloat(proteinMatch[1]));
  }

  return result;
}

/**
 * Mock data for development without API key
 */
function getMockSearchResults(query) {
  const queryLower = query.toLowerCase();

  // Mock restaurant data - comprehensive list
  const mockData = {
    chipotle: [
      { id: 'mock-1', name: 'Chicken Burrito Bowl', brandName: 'Chipotle', calories: 650, protein: 48, carbs: 55, fat: 24, description: 'Chicken, rice, beans, salsa, cheese' },
      { id: 'mock-2', name: 'Steak Burrito', brandName: 'Chipotle', calories: 920, protein: 45, carbs: 88, fat: 38, description: 'Steak, rice, beans, salsa, cheese, sour cream, guacamole in flour tortilla' },
      { id: 'mock-3', name: 'Chicken Salad Bowl', brandName: 'Chipotle', calories: 480, protein: 42, carbs: 18, fat: 28, description: 'Chicken, lettuce, salsa, cheese' },
      { id: 'mock-4', name: 'Carnitas Bowl', brandName: 'Chipotle', calories: 710, protein: 38, carbs: 58, fat: 32, description: 'Carnitas, rice, beans, salsa, cheese' },
      { id: 'mock-5', name: 'Sofritas Bowl', brandName: 'Chipotle', calories: 590, protein: 22, carbs: 62, fat: 28, description: 'Sofritas, rice, beans, salsa' },
    ],
    chickfila: [
      { id: 'mock-6', name: 'Grilled Chicken Sandwich', brandName: "Chick-fil-A", calories: 320, protein: 30, carbs: 36, fat: 6, description: 'Grilled chicken breast on multigrain bun' },
      { id: 'mock-7', name: 'Spicy Deluxe Sandwich', brandName: "Chick-fil-A", calories: 550, protein: 36, carbs: 48, fat: 24, description: 'Spicy chicken breast with lettuce, tomato, pepper jack' },
      { id: 'mock-8', name: 'Grilled Nuggets (12pc)', brandName: "Chick-fil-A", calories: 200, protein: 38, carbs: 4, fat: 4, description: '12 grilled chicken nuggets' },
      { id: 'mock-9', name: 'Cobb Salad', brandName: "Chick-fil-A", calories: 510, protein: 42, carbs: 24, fat: 28, description: 'Grilled chicken, bacon, egg, cheese on mixed greens' },
      { id: 'mock-10', name: 'Original Chicken Sandwich', brandName: "Chick-fil-A", calories: 440, protein: 28, carbs: 40, fat: 18, description: 'Original breaded chicken breast on buttered bun' },
    ],
    'chick-fil-a': [
      { id: 'mock-6', name: 'Grilled Chicken Sandwich', brandName: "Chick-fil-A", calories: 320, protein: 30, carbs: 36, fat: 6, description: 'Grilled chicken breast on multigrain bun' },
      { id: 'mock-7', name: 'Spicy Deluxe Sandwich', brandName: "Chick-fil-A", calories: 550, protein: 36, carbs: 48, fat: 24, description: 'Spicy chicken breast with lettuce, tomato, pepper jack' },
      { id: 'mock-8', name: 'Grilled Nuggets (12pc)', brandName: "Chick-fil-A", calories: 200, protein: 38, carbs: 4, fat: 4, description: '12 grilled chicken nuggets' },
      { id: 'mock-9', name: 'Cobb Salad', brandName: "Chick-fil-A", calories: 510, protein: 42, carbs: 24, fat: 28, description: 'Grilled chicken, bacon, egg, cheese on mixed greens' },
      { id: 'mock-10', name: 'Original Chicken Sandwich', brandName: "Chick-fil-A", calories: 440, protein: 28, carbs: 40, fat: 18, description: 'Original breaded chicken breast on buttered bun' },
    ],
    cava: [
      { id: 'mock-11', name: 'Greens + Grains Bowl', brandName: 'CAVA', calories: 520, protein: 38, carbs: 45, fat: 20, description: 'Grilled chicken, supergreens, brown rice' },
      { id: 'mock-12', name: 'Chicken Pita', brandName: 'CAVA', calories: 620, protein: 36, carbs: 55, fat: 28, description: 'Grilled chicken, hummus, vegetables in warm pita' },
      { id: 'mock-13', name: 'Lamb Meatball Bowl', brandName: 'CAVA', calories: 680, protein: 32, carbs: 52, fat: 38, description: 'Spiced lamb meatballs, rice, tzatziki, vegetables' },
    ],
    shakeshack: [
      { id: 'mock-14', name: 'ShackBurger', brandName: 'Shake Shack', calories: 540, protein: 28, carbs: 40, fat: 32, description: 'Single beef patty, cheese, lettuce, tomato' },
      { id: 'mock-15', name: 'Chicken Shack', brandName: 'Shake Shack', calories: 610, protein: 32, carbs: 52, fat: 30, description: 'Crispy chicken breast, pickles, buttermilk herb mayo' },
      { id: 'mock-16', name: 'Shack Stack', brandName: 'Shake Shack', calories: 830, protein: 35, carbs: 48, fat: 52, description: 'Beef patty, crispy mushroom, cheese, ShackSauce' },
    ],
    'shake shack': [
      { id: 'mock-14', name: 'ShackBurger', brandName: 'Shake Shack', calories: 540, protein: 28, carbs: 40, fat: 32, description: 'Single beef patty, cheese, lettuce, tomato' },
      { id: 'mock-15', name: 'Chicken Shack', brandName: 'Shake Shack', calories: 610, protein: 32, carbs: 52, fat: 30, description: 'Crispy chicken breast, pickles, buttermilk herb mayo' },
      { id: 'mock-16', name: 'Shack Stack', brandName: 'Shake Shack', calories: 830, protein: 35, carbs: 48, fat: 52, description: 'Beef patty, crispy mushroom, cheese, ShackSauce' },
    ],
    subway: [
      { id: 'mock-20', name: 'Turkey Breast Sub (6")', brandName: 'Subway', calories: 280, protein: 18, carbs: 46, fat: 3, description: 'Turkey breast, lettuce, tomato, cucumber on wheat bread' },
      { id: 'mock-21', name: 'Chicken Teriyaki Sub (6")', brandName: 'Subway', calories: 330, protein: 24, carbs: 50, fat: 5, description: 'Teriyaki glazed chicken strips with vegetables' },
      { id: 'mock-22', name: 'Steak & Cheese Sub (6")', brandName: 'Subway', calories: 380, protein: 26, carbs: 47, fat: 10, description: 'Sliced steak with melted cheese' },
      { id: 'mock-23', name: 'Veggie Delite Sub (6")', brandName: 'Subway', calories: 200, protein: 8, carbs: 39, fat: 2, description: 'Fresh vegetables on wheat bread' },
      { id: 'mock-24', name: 'Italian BMT Sub (6")', brandName: 'Subway', calories: 400, protein: 20, carbs: 46, fat: 16, description: 'Pepperoni, salami, ham with cheese' },
      { id: 'mock-25', name: 'Rotisserie Chicken Sub (6")', brandName: 'Subway', calories: 320, protein: 26, carbs: 44, fat: 6, description: 'Rotisserie-style chicken with vegetables' },
    ],
    mcdonalds: [
      { id: 'mock-30', name: 'Big Mac', brandName: "McDonald's", calories: 550, protein: 25, carbs: 45, fat: 30, description: 'Two beef patties, special sauce, lettuce, cheese, pickles, onions' },
      { id: 'mock-31', name: 'McChicken', brandName: "McDonald's", calories: 400, protein: 14, carbs: 39, fat: 21, description: 'Crispy chicken patty with mayo and lettuce' },
      { id: 'mock-32', name: 'Quarter Pounder w/ Cheese', brandName: "McDonald's", calories: 520, protein: 30, carbs: 42, fat: 26, description: 'Quarter pound beef patty with cheese' },
      { id: 'mock-33', name: 'Egg McMuffin', brandName: "McDonald's", calories: 310, protein: 17, carbs: 30, fat: 13, description: 'Egg, Canadian bacon, cheese on English muffin' },
      { id: 'mock-34', name: 'Grilled Chicken Sandwich', brandName: "McDonald's", calories: 380, protein: 32, carbs: 44, fat: 7, description: 'Grilled chicken breast with lettuce and tomato' },
    ],
    "mcdonald's": [
      { id: 'mock-30', name: 'Big Mac', brandName: "McDonald's", calories: 550, protein: 25, carbs: 45, fat: 30, description: 'Two beef patties, special sauce, lettuce, cheese, pickles, onions' },
      { id: 'mock-31', name: 'McChicken', brandName: "McDonald's", calories: 400, protein: 14, carbs: 39, fat: 21, description: 'Crispy chicken patty with mayo and lettuce' },
      { id: 'mock-32', name: 'Quarter Pounder w/ Cheese', brandName: "McDonald's", calories: 520, protein: 30, carbs: 42, fat: 26, description: 'Quarter pound beef patty with cheese' },
      { id: 'mock-33', name: 'Egg McMuffin', brandName: "McDonald's", calories: 310, protein: 17, carbs: 30, fat: 13, description: 'Egg, Canadian bacon, cheese on English muffin' },
      { id: 'mock-34', name: 'Grilled Chicken Sandwich', brandName: "McDonald's", calories: 380, protein: 32, carbs: 44, fat: 7, description: 'Grilled chicken breast with lettuce and tomato' },
    ],
    tacobell: [
      { id: 'mock-40', name: 'Crunchy Taco', brandName: 'Taco Bell', calories: 170, protein: 8, carbs: 13, fat: 10, description: 'Seasoned beef, lettuce, cheese in crunchy shell' },
      { id: 'mock-41', name: 'Burrito Supreme', brandName: 'Taco Bell', calories: 400, protein: 16, carbs: 51, fat: 14, description: 'Beef, beans, rice, sour cream, tomatoes in flour tortilla' },
      { id: 'mock-42', name: 'Chicken Quesadilla', brandName: 'Taco Bell', calories: 520, protein: 27, carbs: 37, fat: 28, description: 'Grilled chicken with melted cheese' },
      { id: 'mock-43', name: 'Power Bowl - Chicken', brandName: 'Taco Bell', calories: 470, protein: 26, carbs: 50, fat: 18, description: 'Chicken, rice, beans, guac, pico, lettuce' },
    ],
    'taco bell': [
      { id: 'mock-40', name: 'Crunchy Taco', brandName: 'Taco Bell', calories: 170, protein: 8, carbs: 13, fat: 10, description: 'Seasoned beef, lettuce, cheese in crunchy shell' },
      { id: 'mock-41', name: 'Burrito Supreme', brandName: 'Taco Bell', calories: 400, protein: 16, carbs: 51, fat: 14, description: 'Beef, beans, rice, sour cream, tomatoes in flour tortilla' },
      { id: 'mock-42', name: 'Chicken Quesadilla', brandName: 'Taco Bell', calories: 520, protein: 27, carbs: 37, fat: 28, description: 'Grilled chicken with melted cheese' },
      { id: 'mock-43', name: 'Power Bowl - Chicken', brandName: 'Taco Bell', calories: 470, protein: 26, carbs: 50, fat: 18, description: 'Chicken, rice, beans, guac, pico, lettuce' },
    ],
    wendys: [
      { id: 'mock-50', name: "Dave's Single", brandName: "Wendy's", calories: 570, protein: 30, carbs: 39, fat: 34, description: 'Quarter pound beef patty, lettuce, tomato, pickles, onion' },
      { id: 'mock-51', name: 'Grilled Chicken Sandwich', brandName: "Wendy's", calories: 370, protein: 34, carbs: 36, fat: 10, description: 'Grilled chicken breast with lettuce and tomato' },
      { id: 'mock-52', name: 'Spicy Chicken Sandwich', brandName: "Wendy's", calories: 500, protein: 28, carbs: 48, fat: 22, description: 'Spicy breaded chicken with lettuce and mayo' },
      { id: 'mock-53', name: 'Baconator', brandName: "Wendy's", calories: 960, protein: 58, carbs: 40, fat: 64, description: 'Two beef patties, six strips of bacon, cheese' },
    ],
    "wendy's": [
      { id: 'mock-50', name: "Dave's Single", brandName: "Wendy's", calories: 570, protein: 30, carbs: 39, fat: 34, description: 'Quarter pound beef patty, lettuce, tomato, pickles, onion' },
      { id: 'mock-51', name: 'Grilled Chicken Sandwich', brandName: "Wendy's", calories: 370, protein: 34, carbs: 36, fat: 10, description: 'Grilled chicken breast with lettuce and tomato' },
      { id: 'mock-52', name: 'Spicy Chicken Sandwich', brandName: "Wendy's", calories: 500, protein: 28, carbs: 48, fat: 22, description: 'Spicy breaded chicken with lettuce and mayo' },
      { id: 'mock-53', name: 'Baconator', brandName: "Wendy's", calories: 960, protein: 58, carbs: 40, fat: 64, description: 'Two beef patties, six strips of bacon, cheese' },
    ],
    panera: [
      { id: 'mock-60', name: 'Fuji Apple Chicken Salad', brandName: 'Panera Bread', calories: 550, protein: 32, carbs: 40, fat: 30, description: 'Chicken, mixed greens, apple chips, gorgonzola, pecans' },
      { id: 'mock-61', name: 'Turkey Sandwich', brandName: 'Panera Bread', calories: 510, protein: 35, carbs: 48, fat: 19, description: 'Smoked turkey, lettuce, tomato on country bread' },
      { id: 'mock-62', name: 'Mediterranean Bowl', brandName: 'Panera Bread', calories: 520, protein: 24, carbs: 55, fat: 22, description: 'Chicken, quinoa, hummus, feta, vegetables' },
    ],
    'panera bread': [
      { id: 'mock-60', name: 'Fuji Apple Chicken Salad', brandName: 'Panera Bread', calories: 550, protein: 32, carbs: 40, fat: 30, description: 'Chicken, mixed greens, apple chips, gorgonzola, pecans' },
      { id: 'mock-61', name: 'Turkey Sandwich', brandName: 'Panera Bread', calories: 510, protein: 35, carbs: 48, fat: 19, description: 'Smoked turkey, lettuce, tomato on country bread' },
      { id: 'mock-62', name: 'Mediterranean Bowl', brandName: 'Panera Bread', calories: 520, protein: 24, carbs: 55, fat: 22, description: 'Chicken, quinoa, hummus, feta, vegetables' },
    ],
    starbucks: [
      { id: 'mock-70', name: 'Egg White & Roasted Red Pepper Egg Bites', brandName: 'Starbucks', calories: 170, protein: 13, carbs: 9, fat: 8, description: 'Cage-free egg whites, roasted red peppers, spinach' },
      { id: 'mock-71', name: 'Chicken & Quinoa Protein Bowl', brandName: 'Starbucks', calories: 420, protein: 28, carbs: 38, fat: 18, description: 'Chicken, quinoa, greens, vegetables' },
      { id: 'mock-72', name: 'Turkey Bacon & Egg White Sandwich', brandName: 'Starbucks', calories: 230, protein: 16, carbs: 28, fat: 5, description: 'Egg whites, turkey bacon on English muffin' },
    ],
    jerseysmikes: [
      { id: 'mock-80', name: 'Turkey & Provolone Sub', brandName: "Jersey Mike's", calories: 520, protein: 32, carbs: 52, fat: 20, description: 'Turkey breast, provolone, lettuce, tomato, onion' },
      { id: 'mock-81', name: 'Chicken Philly Sub', brandName: "Jersey Mike's", calories: 620, protein: 38, carbs: 56, fat: 26, description: 'Grilled chicken, peppers, onions, melted cheese' },
      { id: 'mock-82', name: 'Club Supreme Sub', brandName: "Jersey Mike's", calories: 680, protein: 40, carbs: 54, fat: 34, description: 'Turkey, ham, bacon, provolone, mayo' },
    ],
    "jersey mike's": [
      { id: 'mock-80', name: 'Turkey & Provolone Sub', brandName: "Jersey Mike's", calories: 520, protein: 32, carbs: 52, fat: 20, description: 'Turkey breast, provolone, lettuce, tomato, onion' },
      { id: 'mock-81', name: 'Chicken Philly Sub', brandName: "Jersey Mike's", calories: 620, protein: 38, carbs: 56, fat: 26, description: 'Grilled chicken, peppers, onions, melted cheese' },
      { id: 'mock-82', name: 'Club Supreme Sub', brandName: "Jersey Mike's", calories: 680, protein: 40, carbs: 54, fat: 34, description: 'Turkey, ham, bacon, provolone, mayo' },
    ],
    whataburger: [
      { id: 'mock-90', name: 'Whataburger', brandName: 'Whataburger', calories: 590, protein: 30, carbs: 58, fat: 26, description: 'Beef patty, lettuce, tomato, pickles, onion on large bun' },
      { id: 'mock-91', name: 'Grilled Chicken Sandwich', brandName: 'Whataburger', calories: 430, protein: 32, carbs: 48, fat: 12, description: 'Grilled chicken breast with vegetables' },
      { id: 'mock-92', name: 'Bacon & Cheese Whataburger', brandName: 'Whataburger', calories: 800, protein: 40, carbs: 58, fat: 45, description: 'Beef patty with bacon and cheese' },
    ],
    buffalowildwings: [
      { id: 'mock-100', name: 'Traditional Wings (10pc)', brandName: 'Buffalo Wild Wings', calories: 740, protein: 60, carbs: 2, fat: 54, description: '10 bone-in wings with your choice of sauce' },
      { id: 'mock-101', name: 'Boneless Wings (10pc)', brandName: 'Buffalo Wild Wings', calories: 810, protein: 48, carbs: 48, fat: 48, description: '10 boneless wings with your choice of sauce' },
      { id: 'mock-102', name: 'Grilled Chicken Wrap', brandName: 'Buffalo Wild Wings', calories: 520, protein: 34, carbs: 42, fat: 24, description: 'Grilled chicken, lettuce, tomato in flour tortilla' },
    ],
    'buffalo wild wings': [
      { id: 'mock-100', name: 'Traditional Wings (10pc)', brandName: 'Buffalo Wild Wings', calories: 740, protein: 60, carbs: 2, fat: 54, description: '10 bone-in wings with your choice of sauce' },
      { id: 'mock-101', name: 'Boneless Wings (10pc)', brandName: 'Buffalo Wild Wings', calories: 810, protein: 48, carbs: 48, fat: 48, description: '10 boneless wings with your choice of sauce' },
      { id: 'mock-102', name: 'Grilled Chicken Wrap', brandName: 'Buffalo Wild Wings', calories: 520, protein: 34, carbs: 42, fat: 24, description: 'Grilled chicken, lettuce, tomato in flour tortilla' },
    ],
    sonic: [
      { id: 'mock-110', name: 'SuperSONIC Cheeseburger', brandName: 'Sonic', calories: 880, protein: 40, carbs: 56, fat: 56, description: 'Two beef patties, cheese, lettuce, tomato, pickles' },
      { id: 'mock-111', name: 'Popcorn Chicken', brandName: 'Sonic', calories: 380, protein: 20, carbs: 28, fat: 22, description: 'Bite-sized crispy chicken pieces' },
      { id: 'mock-112', name: 'Classic Grilled Chicken Sandwich', brandName: 'Sonic', calories: 440, protein: 30, carbs: 40, fat: 18, description: 'Grilled chicken with lettuce, tomato, mayo' },
    ],
    sweetgreen: [
      { id: 'mock-120', name: 'Harvest Bowl', brandName: 'Sweetgreen', calories: 705, protein: 24, carbs: 48, fat: 46, description: 'Chicken, sweet potato, apples, goat cheese, wild rice' },
      { id: 'mock-121', name: 'Kale Caesar', brandName: 'Sweetgreen', calories: 450, protein: 32, carbs: 22, fat: 28, description: 'Kale, romaine, parmesan, chicken, caesar dressing' },
      { id: 'mock-122', name: 'Chicken Pesto Parm', brandName: 'Sweetgreen', calories: 620, protein: 38, carbs: 42, fat: 32, description: 'Chicken, pesto, parmesan, tomatoes, warm grains' },
    ],
    // Pizza Chains
    papajohns: [
      { id: 'mock-130', name: 'Garden Fresh Pizza (Large, 1 slice)', brandName: "Papa John's", calories: 200, protein: 8, carbs: 26, fat: 7, description: 'Mushrooms, onions, green peppers, black olives' },
      { id: 'mock-131', name: 'Chicken & Veggie Pizza (Large, 1 slice)', brandName: "Papa John's", calories: 230, protein: 12, carbs: 27, fat: 8, description: 'Grilled chicken, fresh vegetables' },
      { id: 'mock-132', name: 'The Works Pizza (Large, 1 slice)', brandName: "Papa John's", calories: 310, protein: 14, carbs: 28, fat: 16, description: 'Pepperoni, sausage, mushrooms, onions, peppers' },
      { id: 'mock-133', name: 'Pepperoni Pizza (Large, 1 slice)', brandName: "Papa John's", calories: 290, protein: 12, carbs: 27, fat: 14, description: 'Classic pepperoni with cheese' },
      { id: 'mock-134', name: 'Chicken Poppers', brandName: "Papa John's", calories: 360, protein: 22, carbs: 28, fat: 18, description: 'Breaded chicken pieces with dipping sauce' },
    ],
    "papa john's": [
      { id: 'mock-130', name: 'Garden Fresh Pizza (Large, 1 slice)', brandName: "Papa John's", calories: 200, protein: 8, carbs: 26, fat: 7, description: 'Mushrooms, onions, green peppers, black olives' },
      { id: 'mock-131', name: 'Chicken & Veggie Pizza (Large, 1 slice)', brandName: "Papa John's", calories: 230, protein: 12, carbs: 27, fat: 8, description: 'Grilled chicken, fresh vegetables' },
      { id: 'mock-132', name: 'The Works Pizza (Large, 1 slice)', brandName: "Papa John's", calories: 310, protein: 14, carbs: 28, fat: 16, description: 'Pepperoni, sausage, mushrooms, onions, peppers' },
      { id: 'mock-133', name: 'Pepperoni Pizza (Large, 1 slice)', brandName: "Papa John's", calories: 290, protein: 12, carbs: 27, fat: 14, description: 'Classic pepperoni with cheese' },
      { id: 'mock-134', name: 'Chicken Poppers', brandName: "Papa John's", calories: 360, protein: 22, carbs: 28, fat: 18, description: 'Breaded chicken pieces with dipping sauce' },
    ],
    dominos: [
      { id: 'mock-140', name: 'Hand Tossed Cheese Pizza (Large, 1 slice)', brandName: "Domino's", calories: 200, protein: 8, carbs: 28, fat: 6, description: 'Classic cheese pizza' },
      { id: 'mock-141', name: 'Pacific Veggie Pizza (Large, 1 slice)', brandName: "Domino's", calories: 230, protein: 9, carbs: 30, fat: 8, description: 'Roasted red peppers, spinach, onions, tomatoes, mushrooms' },
      { id: 'mock-142', name: 'Chicken Bacon Ranch (Large, 1 slice)', brandName: "Domino's", calories: 290, protein: 14, carbs: 28, fat: 14, description: 'Grilled chicken, bacon, ranch' },
      { id: 'mock-143', name: 'Grilled Chicken Caesar Salad', brandName: "Domino's", calories: 180, protein: 18, carbs: 8, fat: 9, description: 'Grilled chicken, romaine, parmesan, caesar dressing' },
    ],
    "domino's": [
      { id: 'mock-140', name: 'Hand Tossed Cheese Pizza (Large, 1 slice)', brandName: "Domino's", calories: 200, protein: 8, carbs: 28, fat: 6, description: 'Classic cheese pizza' },
      { id: 'mock-141', name: 'Pacific Veggie Pizza (Large, 1 slice)', brandName: "Domino's", calories: 230, protein: 9, carbs: 30, fat: 8, description: 'Roasted red peppers, spinach, onions, tomatoes, mushrooms' },
      { id: 'mock-142', name: 'Chicken Bacon Ranch (Large, 1 slice)', brandName: "Domino's", calories: 290, protein: 14, carbs: 28, fat: 14, description: 'Grilled chicken, bacon, ranch' },
      { id: 'mock-143', name: 'Grilled Chicken Caesar Salad', brandName: "Domino's", calories: 180, protein: 18, carbs: 8, fat: 9, description: 'Grilled chicken, romaine, parmesan, caesar dressing' },
    ],
    pizzahut: [
      { id: 'mock-150', name: 'Veggie Lover\'s Pizza (Large, 1 slice)', brandName: 'Pizza Hut', calories: 200, protein: 8, carbs: 26, fat: 8, description: 'Mushrooms, red onions, green peppers, tomatoes' },
      { id: 'mock-151', name: 'Chicken Supreme (Large, 1 slice)', brandName: 'Pizza Hut', calories: 240, protein: 12, carbs: 26, fat: 10, description: 'Grilled chicken, mushrooms, peppers' },
      { id: 'mock-152', name: 'Meat Lover\'s Pizza (Large, 1 slice)', brandName: 'Pizza Hut', calories: 340, protein: 16, carbs: 26, fat: 20, description: 'Pepperoni, sausage, ham, bacon, beef' },
      { id: 'mock-153', name: 'Naked Wings (8pc)', brandName: 'Pizza Hut', calories: 380, protein: 32, carbs: 2, fat: 28, description: 'Unbreaded bone-in wings' },
    ],
    'pizza hut': [
      { id: 'mock-150', name: 'Veggie Lover\'s Pizza (Large, 1 slice)', brandName: 'Pizza Hut', calories: 200, protein: 8, carbs: 26, fat: 8, description: 'Mushrooms, red onions, green peppers, tomatoes' },
      { id: 'mock-151', name: 'Chicken Supreme (Large, 1 slice)', brandName: 'Pizza Hut', calories: 240, protein: 12, carbs: 26, fat: 10, description: 'Grilled chicken, mushrooms, peppers' },
      { id: 'mock-152', name: 'Meat Lover\'s Pizza (Large, 1 slice)', brandName: 'Pizza Hut', calories: 340, protein: 16, carbs: 26, fat: 20, description: 'Pepperoni, sausage, ham, bacon, beef' },
      { id: 'mock-153', name: 'Naked Wings (8pc)', brandName: 'Pizza Hut', calories: 380, protein: 32, carbs: 2, fat: 28, description: 'Unbreaded bone-in wings' },
    ],
    // Casual Dining
    chilis: [
      { id: 'mock-160', name: 'Grilled Chicken Salad', brandName: "Chili's", calories: 430, protein: 42, carbs: 22, fat: 20, description: 'Grilled chicken breast on mixed greens with corn, beans, pico' },
      { id: 'mock-161', name: '6 oz Sirloin with Grilled Avocado', brandName: "Chili's", calories: 540, protein: 48, carbs: 18, fat: 32, description: 'USDA Choice sirloin with grilled avocado, pico' },
      { id: 'mock-162', name: 'Ancho Salmon', brandName: "Chili's", calories: 590, protein: 44, carbs: 28, fat: 35, description: 'Salmon with ancho chile glaze, rice, vegetables' },
      { id: 'mock-163', name: 'Margarita Grilled Chicken', brandName: "Chili's", calories: 550, protein: 52, carbs: 32, fat: 22, description: 'Citrus-marinated chicken with rice and vegetables' },
      { id: 'mock-164', name: 'Classic Sirloin (10oz)', brandName: "Chili's", calories: 450, protein: 55, carbs: 5, fat: 24, description: 'USDA Choice sirloin steak' },
      { id: 'mock-165', name: 'Grilled Chicken Fajitas', brandName: "Chili's", calories: 480, protein: 45, carbs: 28, fat: 22, description: 'Sizzling chicken with peppers and onions' },
    ],
    "chili's": [
      { id: 'mock-160', name: 'Grilled Chicken Salad', brandName: "Chili's", calories: 430, protein: 42, carbs: 22, fat: 20, description: 'Grilled chicken breast on mixed greens with corn, beans, pico' },
      { id: 'mock-161', name: '6 oz Sirloin with Grilled Avocado', brandName: "Chili's", calories: 540, protein: 48, carbs: 18, fat: 32, description: 'USDA Choice sirloin with grilled avocado, pico' },
      { id: 'mock-162', name: 'Ancho Salmon', brandName: "Chili's", calories: 590, protein: 44, carbs: 28, fat: 35, description: 'Salmon with ancho chile glaze, rice, vegetables' },
      { id: 'mock-163', name: 'Margarita Grilled Chicken', brandName: "Chili's", calories: 550, protein: 52, carbs: 32, fat: 22, description: 'Citrus-marinated chicken with rice and vegetables' },
      { id: 'mock-164', name: 'Classic Sirloin (10oz)', brandName: "Chili's", calories: 450, protein: 55, carbs: 5, fat: 24, description: 'USDA Choice sirloin steak' },
      { id: 'mock-165', name: 'Grilled Chicken Fajitas', brandName: "Chili's", calories: 480, protein: 45, carbs: 28, fat: 22, description: 'Sizzling chicken with peppers and onions' },
    ],
    applebees: [
      { id: 'mock-170', name: 'Grilled Chicken Breast', brandName: "Applebee's", calories: 390, protein: 52, carbs: 8, fat: 16, description: 'Grilled chicken with steamed broccoli' },
      { id: 'mock-171', name: 'Cedar Grilled Lemon Chicken', brandName: "Applebee's", calories: 580, protein: 48, carbs: 32, fat: 28, description: 'Grilled chicken with garlic mashed potatoes' },
      { id: 'mock-172', name: 'Top Sirloin (8oz)', brandName: "Applebee's", calories: 350, protein: 48, carbs: 2, fat: 16, description: 'USDA Select sirloin steak' },
      { id: 'mock-173', name: 'Blackened Cajun Salmon', brandName: "Applebee's", calories: 470, protein: 42, carbs: 15, fat: 28, description: 'Blackened salmon with Cajun spices' },
      { id: 'mock-174', name: 'Thai Shrimp Salad', brandName: "Applebee's", calories: 400, protein: 32, carbs: 35, fat: 16, description: 'Shrimp, greens, crispy noodles, peanut dressing' },
    ],
    "applebee's": [
      { id: 'mock-170', name: 'Grilled Chicken Breast', brandName: "Applebee's", calories: 390, protein: 52, carbs: 8, fat: 16, description: 'Grilled chicken with steamed broccoli' },
      { id: 'mock-171', name: 'Cedar Grilled Lemon Chicken', brandName: "Applebee's", calories: 580, protein: 48, carbs: 32, fat: 28, description: 'Grilled chicken with garlic mashed potatoes' },
      { id: 'mock-172', name: 'Top Sirloin (8oz)', brandName: "Applebee's", calories: 350, protein: 48, carbs: 2, fat: 16, description: 'USDA Select sirloin steak' },
      { id: 'mock-173', name: 'Blackened Cajun Salmon', brandName: "Applebee's", calories: 470, protein: 42, carbs: 15, fat: 28, description: 'Blackened salmon with Cajun spices' },
      { id: 'mock-174', name: 'Thai Shrimp Salad', brandName: "Applebee's", calories: 400, protein: 32, carbs: 35, fat: 16, description: 'Shrimp, greens, crispy noodles, peanut dressing' },
    ],
    olivegarden: [
      { id: 'mock-180', name: 'Herb-Grilled Salmon', brandName: 'Olive Garden', calories: 510, protein: 48, carbs: 15, fat: 30, description: 'Grilled salmon with garlic herb butter, broccoli' },
      { id: 'mock-181', name: 'Chicken Margherita', brandName: 'Olive Garden', calories: 590, protein: 56, carbs: 22, fat: 32, description: 'Grilled chicken with tomatoes, mozzarella, basil' },
      { id: 'mock-182', name: 'Grilled Chicken Caesar Salad', brandName: 'Olive Garden', calories: 420, protein: 38, carbs: 18, fat: 24, description: 'Grilled chicken, romaine, parmesan, caesar dressing' },
      { id: 'mock-183', name: 'Shrimp Scampi', brandName: 'Olive Garden', calories: 620, protein: 32, carbs: 68, fat: 24, description: 'Shrimp sautéed in garlic butter with linguine' },
      { id: 'mock-184', name: 'Chicken Parmigiana', brandName: 'Olive Garden', calories: 1060, protein: 62, carbs: 78, fat: 52, description: 'Breaded chicken with marinara and cheese' },
      { id: 'mock-185', name: 'Grilled Chicken Flatbread', brandName: 'Olive Garden', calories: 760, protein: 42, carbs: 64, fat: 38, description: 'Grilled chicken, mozzarella, roasted peppers' },
    ],
    'olive garden': [
      { id: 'mock-180', name: 'Herb-Grilled Salmon', brandName: 'Olive Garden', calories: 510, protein: 48, carbs: 15, fat: 30, description: 'Grilled salmon with garlic herb butter, broccoli' },
      { id: 'mock-181', name: 'Chicken Margherita', brandName: 'Olive Garden', calories: 590, protein: 56, carbs: 22, fat: 32, description: 'Grilled chicken with tomatoes, mozzarella, basil' },
      { id: 'mock-182', name: 'Grilled Chicken Caesar Salad', brandName: 'Olive Garden', calories: 420, protein: 38, carbs: 18, fat: 24, description: 'Grilled chicken, romaine, parmesan, caesar dressing' },
      { id: 'mock-183', name: 'Shrimp Scampi', brandName: 'Olive Garden', calories: 620, protein: 32, carbs: 68, fat: 24, description: 'Shrimp sautéed in garlic butter with linguine' },
      { id: 'mock-184', name: 'Chicken Parmigiana', brandName: 'Olive Garden', calories: 1060, protein: 62, carbs: 78, fat: 52, description: 'Breaded chicken with marinara and cheese' },
      { id: 'mock-185', name: 'Grilled Chicken Flatbread', brandName: 'Olive Garden', calories: 760, protein: 42, carbs: 64, fat: 38, description: 'Grilled chicken, mozzarella, roasted peppers' },
    ],
    redlobster: [
      { id: 'mock-190', name: 'Live Maine Lobster (Steamed)', brandName: 'Red Lobster', calories: 350, protein: 42, carbs: 2, fat: 18, description: 'Whole steamed Maine lobster with butter' },
      { id: 'mock-191', name: 'Garlic Shrimp Scampi', brandName: 'Red Lobster', calories: 410, protein: 28, carbs: 42, fat: 16, description: 'Shrimp in garlic butter sauce with linguine' },
      { id: 'mock-192', name: 'Wood-Grilled Salmon', brandName: 'Red Lobster', calories: 480, protein: 52, carbs: 8, fat: 26, description: 'Atlantic salmon grilled on wood planks' },
      { id: 'mock-193', name: 'Sailor\'s Platter', brandName: 'Red Lobster', calories: 720, protein: 48, carbs: 52, fat: 38, description: 'Shrimp, bay scallops, clam strips, flounder' },
      { id: 'mock-194', name: 'Grilled Tilapia', brandName: 'Red Lobster', calories: 280, protein: 38, carbs: 4, fat: 12, description: 'Seasoned tilapia with lemon' },
      { id: 'mock-195', name: 'Bar Harbor Lobster Bake', brandName: 'Red Lobster', calories: 520, protein: 48, carbs: 28, fat: 24, description: 'Lobster tail, snow crab, shrimp, mussels, corn' },
    ],
    'red lobster': [
      { id: 'mock-190', name: 'Live Maine Lobster (Steamed)', brandName: 'Red Lobster', calories: 350, protein: 42, carbs: 2, fat: 18, description: 'Whole steamed Maine lobster with butter' },
      { id: 'mock-191', name: 'Garlic Shrimp Scampi', brandName: 'Red Lobster', calories: 410, protein: 28, carbs: 42, fat: 16, description: 'Shrimp in garlic butter sauce with linguine' },
      { id: 'mock-192', name: 'Wood-Grilled Salmon', brandName: 'Red Lobster', calories: 480, protein: 52, carbs: 8, fat: 26, description: 'Atlantic salmon grilled on wood planks' },
      { id: 'mock-193', name: 'Sailor\'s Platter', brandName: 'Red Lobster', calories: 720, protein: 48, carbs: 52, fat: 38, description: 'Shrimp, bay scallops, clam strips, flounder' },
      { id: 'mock-194', name: 'Grilled Tilapia', brandName: 'Red Lobster', calories: 280, protein: 38, carbs: 4, fat: 12, description: 'Seasoned tilapia with lemon' },
      { id: 'mock-195', name: 'Bar Harbor Lobster Bake', brandName: 'Red Lobster', calories: 520, protein: 48, carbs: 28, fat: 24, description: 'Lobster tail, snow crab, shrimp, mussels, corn' },
    ],
    outback: [
      { id: 'mock-200', name: 'Victoria\'s Filet (6oz)', brandName: 'Outback Steakhouse', calories: 270, protein: 44, carbs: 0, fat: 10, description: 'Tender center-cut filet mignon' },
      { id: 'mock-201', name: 'Perfectly Grilled Salmon', brandName: 'Outback Steakhouse', calories: 530, protein: 52, carbs: 4, fat: 34, description: 'Flame-grilled Atlantic salmon' },
      { id: 'mock-202', name: 'Grilled Chicken on the Barbie', brandName: 'Outback Steakhouse', calories: 380, protein: 55, carbs: 8, fat: 14, description: 'Seasoned grilled chicken breast' },
      { id: 'mock-203', name: 'Outback Center-Cut Sirloin (6oz)', brandName: 'Outback Steakhouse', calories: 240, protein: 40, carbs: 0, fat: 8, description: 'Seasoned and seared sirloin' },
      { id: 'mock-204', name: 'Queensland Salad', brandName: 'Outback Steakhouse', calories: 450, protein: 42, carbs: 24, fat: 22, description: 'Grilled chicken, mixed greens, cheese, bacon' },
    ],
    'outback steakhouse': [
      { id: 'mock-200', name: 'Victoria\'s Filet (6oz)', brandName: 'Outback Steakhouse', calories: 270, protein: 44, carbs: 0, fat: 10, description: 'Tender center-cut filet mignon' },
      { id: 'mock-201', name: 'Perfectly Grilled Salmon', brandName: 'Outback Steakhouse', calories: 530, protein: 52, carbs: 4, fat: 34, description: 'Flame-grilled Atlantic salmon' },
      { id: 'mock-202', name: 'Grilled Chicken on the Barbie', brandName: 'Outback Steakhouse', calories: 380, protein: 55, carbs: 8, fat: 14, description: 'Seasoned grilled chicken breast' },
      { id: 'mock-203', name: 'Outback Center-Cut Sirloin (6oz)', brandName: 'Outback Steakhouse', calories: 240, protein: 40, carbs: 0, fat: 8, description: 'Seasoned and seared sirloin' },
      { id: 'mock-204', name: 'Queensland Salad', brandName: 'Outback Steakhouse', calories: 450, protein: 42, carbs: 24, fat: 22, description: 'Grilled chicken, mixed greens, cheese, bacon' },
    ],
    texasroadhouse: [
      { id: 'mock-210', name: '6 oz USDA Choice Sirloin', brandName: 'Texas Roadhouse', calories: 250, protein: 42, carbs: 0, fat: 9, description: 'Hand-cut USDA Choice sirloin' },
      { id: 'mock-211', name: 'Grilled Salmon', brandName: 'Texas Roadhouse', calories: 480, protein: 48, carbs: 8, fat: 28, description: 'Fresh Atlantic salmon with seasoning' },
      { id: 'mock-212', name: 'Grilled Chicken Salad', brandName: 'Texas Roadhouse', calories: 380, protein: 40, carbs: 18, fat: 18, description: 'Grilled chicken on mixed greens' },
      { id: 'mock-213', name: 'Herb Crusted Chicken', brandName: 'Texas Roadhouse', calories: 380, protein: 48, carbs: 12, fat: 16, description: 'Grilled chicken with herb seasoning' },
      { id: 'mock-214', name: 'Grilled Pork Chops', brandName: 'Texas Roadhouse', calories: 420, protein: 52, carbs: 2, fat: 22, description: 'Two bone-in grilled pork chops' },
    ],
    'texas roadhouse': [
      { id: 'mock-210', name: '6 oz USDA Choice Sirloin', brandName: 'Texas Roadhouse', calories: 250, protein: 42, carbs: 0, fat: 9, description: 'Hand-cut USDA Choice sirloin' },
      { id: 'mock-211', name: 'Grilled Salmon', brandName: 'Texas Roadhouse', calories: 480, protein: 48, carbs: 8, fat: 28, description: 'Fresh Atlantic salmon with seasoning' },
      { id: 'mock-212', name: 'Grilled Chicken Salad', brandName: 'Texas Roadhouse', calories: 380, protein: 40, carbs: 18, fat: 18, description: 'Grilled chicken on mixed greens' },
      { id: 'mock-213', name: 'Herb Crusted Chicken', brandName: 'Texas Roadhouse', calories: 380, protein: 48, carbs: 12, fat: 16, description: 'Grilled chicken with herb seasoning' },
      { id: 'mock-214', name: 'Grilled Pork Chops', brandName: 'Texas Roadhouse', calories: 420, protein: 52, carbs: 2, fat: 22, description: 'Two bone-in grilled pork chops' },
    ],
    tgifridays: [
      { id: 'mock-220', name: 'Grilled Chicken', brandName: 'TGI Friday\'s', calories: 360, protein: 48, carbs: 6, fat: 16, description: 'Seasoned grilled chicken breast' },
      { id: 'mock-221', name: 'Sirloin Steak (6oz)', brandName: 'TGI Friday\'s', calories: 280, protein: 42, carbs: 2, fat: 12, description: 'USDA Choice sirloin' },
      { id: 'mock-222', name: 'Grilled Salmon', brandName: 'TGI Friday\'s', calories: 440, protein: 45, carbs: 8, fat: 26, description: 'Atlantic salmon with lemon butter' },
      { id: 'mock-223', name: 'Million Dollar Cobb Salad', brandName: 'TGI Friday\'s', calories: 520, protein: 38, carbs: 22, fat: 34, description: 'Chicken, bacon, eggs, avocado on greens' },
    ],
    'tgi fridays': [
      { id: 'mock-220', name: 'Grilled Chicken', brandName: 'TGI Friday\'s', calories: 360, protein: 48, carbs: 6, fat: 16, description: 'Seasoned grilled chicken breast' },
      { id: 'mock-221', name: 'Sirloin Steak (6oz)', brandName: 'TGI Friday\'s', calories: 280, protein: 42, carbs: 2, fat: 12, description: 'USDA Choice sirloin' },
      { id: 'mock-222', name: 'Grilled Salmon', brandName: 'TGI Friday\'s', calories: 440, protein: 45, carbs: 8, fat: 26, description: 'Atlantic salmon with lemon butter' },
      { id: 'mock-223', name: 'Million Dollar Cobb Salad', brandName: 'TGI Friday\'s', calories: 520, protein: 38, carbs: 22, fat: 34, description: 'Chicken, bacon, eggs, avocado on greens' },
    ],
    // Fast Food - Additional
    popeyes: [
      { id: 'mock-230', name: 'Blackened Chicken Tenders (3pc)', brandName: 'Popeyes', calories: 170, protein: 26, carbs: 2, fat: 7, description: 'Blackened seasoned chicken tenders' },
      { id: 'mock-231', name: 'Blackened Chicken Sandwich', brandName: 'Popeyes', calories: 480, protein: 35, carbs: 42, fat: 18, description: 'Blackened chicken breast on brioche bun' },
      { id: 'mock-232', name: 'Classic Chicken Sandwich', brandName: 'Popeyes', calories: 700, protein: 28, carbs: 50, fat: 42, description: 'Crispy chicken breast with pickles on brioche' },
      { id: 'mock-233', name: 'Naked Chicken Tenders (5pc)', brandName: 'Popeyes', calories: 340, protein: 45, carbs: 4, fat: 16, description: 'Unbreaded chicken tenders' },
    ],
    "popeye's": [
      { id: 'mock-230', name: 'Blackened Chicken Tenders (3pc)', brandName: 'Popeyes', calories: 170, protein: 26, carbs: 2, fat: 7, description: 'Blackened seasoned chicken tenders' },
      { id: 'mock-231', name: 'Blackened Chicken Sandwich', brandName: 'Popeyes', calories: 480, protein: 35, carbs: 42, fat: 18, description: 'Blackened chicken breast on brioche bun' },
      { id: 'mock-232', name: 'Classic Chicken Sandwich', brandName: 'Popeyes', calories: 700, protein: 28, carbs: 50, fat: 42, description: 'Crispy chicken breast with pickles on brioche' },
      { id: 'mock-233', name: 'Naked Chicken Tenders (5pc)', brandName: 'Popeyes', calories: 340, protein: 45, carbs: 4, fat: 16, description: 'Unbreaded chicken tenders' },
    ],
    burgerking: [
      { id: 'mock-240', name: 'Whopper Jr (no mayo)', brandName: 'Burger King', calories: 240, protein: 13, carbs: 26, fat: 10, description: 'Flame-grilled beef patty with vegetables' },
      { id: 'mock-241', name: 'Grilled Chicken Sandwich', brandName: 'Burger King', calories: 430, protein: 37, carbs: 39, fat: 16, description: 'Grilled chicken breast on sesame bun' },
      { id: 'mock-242', name: 'Impossible Whopper', brandName: 'Burger King', calories: 630, protein: 25, carbs: 58, fat: 34, description: 'Plant-based patty with mayo, vegetables' },
      { id: 'mock-243', name: 'Chicken Garden Salad', brandName: 'Burger King', calories: 200, protein: 22, carbs: 8, fat: 9, description: 'Grilled chicken on mixed greens' },
    ],
    'burger king': [
      { id: 'mock-240', name: 'Whopper Jr (no mayo)', brandName: 'Burger King', calories: 240, protein: 13, carbs: 26, fat: 10, description: 'Flame-grilled beef patty with vegetables' },
      { id: 'mock-241', name: 'Grilled Chicken Sandwich', brandName: 'Burger King', calories: 430, protein: 37, carbs: 39, fat: 16, description: 'Grilled chicken breast on sesame bun' },
      { id: 'mock-242', name: 'Impossible Whopper', brandName: 'Burger King', calories: 630, protein: 25, carbs: 58, fat: 34, description: 'Plant-based patty with mayo, vegetables' },
      { id: 'mock-243', name: 'Chicken Garden Salad', brandName: 'Burger King', calories: 200, protein: 22, carbs: 8, fat: 9, description: 'Grilled chicken on mixed greens' },
    ],
    kfc: [
      { id: 'mock-250', name: 'Kentucky Grilled Chicken Breast', brandName: 'KFC', calories: 210, protein: 38, carbs: 0, fat: 7, description: 'Grilled chicken breast' },
      { id: 'mock-251', name: 'Kentucky Grilled Chicken Thigh', brandName: 'KFC', calories: 150, protein: 17, carbs: 0, fat: 9, description: 'Grilled chicken thigh' },
      { id: 'mock-252', name: 'Original Recipe Chicken Breast', brandName: 'KFC', calories: 390, protein: 39, carbs: 11, fat: 21, description: 'Original recipe fried chicken breast' },
      { id: 'mock-253', name: 'Green Beans', brandName: 'KFC', calories: 25, protein: 1, carbs: 5, fat: 0, description: 'Seasoned green beans side' },
    ],
    fiveguys: [
      { id: 'mock-260', name: 'Little Hamburger', brandName: 'Five Guys', calories: 480, protein: 25, carbs: 39, fat: 26, description: 'Single patty burger with toppings' },
      { id: 'mock-261', name: 'Hamburger (Double)', brandName: 'Five Guys', calories: 700, protein: 40, carbs: 39, fat: 43, description: 'Two patty burger with toppings' },
      { id: 'mock-262', name: 'Grilled Cheese', brandName: 'Five Guys', calories: 470, protein: 11, carbs: 41, fat: 26, description: 'Melted American cheese on bun' },
      { id: 'mock-263', name: 'Veggie Sandwich', brandName: 'Five Guys', calories: 280, protein: 8, carbs: 40, fat: 15, description: 'Grilled vegetables on bun' },
    ],
    'five guys': [
      { id: 'mock-260', name: 'Little Hamburger', brandName: 'Five Guys', calories: 480, protein: 25, carbs: 39, fat: 26, description: 'Single patty burger with toppings' },
      { id: 'mock-261', name: 'Hamburger (Double)', brandName: 'Five Guys', calories: 700, protein: 40, carbs: 39, fat: 43, description: 'Two patty burger with toppings' },
      { id: 'mock-262', name: 'Grilled Cheese', brandName: 'Five Guys', calories: 470, protein: 11, carbs: 41, fat: 26, description: 'Melted American cheese on bun' },
      { id: 'mock-263', name: 'Veggie Sandwich', brandName: 'Five Guys', calories: 280, protein: 8, carbs: 40, fat: 15, description: 'Grilled vegetables on bun' },
    ],
    // Breakfast/Coffee
    dunkin: [
      { id: 'mock-270', name: 'Egg White Veggie Wake-Up Wrap', brandName: 'Dunkin\'', calories: 180, protein: 11, carbs: 14, fat: 9, description: 'Egg whites, veggies, cheese in wrap' },
      { id: 'mock-271', name: 'Turkey Sausage Egg & Cheese', brandName: 'Dunkin\'', calories: 390, protein: 21, carbs: 33, fat: 19, description: 'Turkey sausage, egg, cheese on English muffin' },
      { id: 'mock-272', name: 'Veggie Egg White Omelet', brandName: 'Dunkin\'', calories: 280, protein: 18, carbs: 25, fat: 12, description: 'Egg white omelet with vegetables on croissant' },
      { id: 'mock-273', name: 'Grilled Cheese Melt', brandName: 'Dunkin\'', calories: 390, protein: 15, carbs: 36, fat: 21, description: 'Melted cheese on sourdough' },
    ],
    "dunkin'": [
      { id: 'mock-270', name: 'Egg White Veggie Wake-Up Wrap', brandName: 'Dunkin\'', calories: 180, protein: 11, carbs: 14, fat: 9, description: 'Egg whites, veggies, cheese in wrap' },
      { id: 'mock-271', name: 'Turkey Sausage Egg & Cheese', brandName: 'Dunkin\'', calories: 390, protein: 21, carbs: 33, fat: 19, description: 'Turkey sausage, egg, cheese on English muffin' },
      { id: 'mock-272', name: 'Veggie Egg White Omelet', brandName: 'Dunkin\'', calories: 280, protein: 18, carbs: 25, fat: 12, description: 'Egg white omelet with vegetables on croissant' },
      { id: 'mock-273', name: 'Grilled Cheese Melt', brandName: 'Dunkin\'', calories: 390, protein: 15, carbs: 36, fat: 21, description: 'Melted cheese on sourdough' },
    ],
    ihop: [
      { id: 'mock-280', name: 'Simple & Fit 2-Egg Breakfast', brandName: 'IHOP', calories: 390, protein: 28, carbs: 30, fat: 18, description: 'Two eggs, turkey bacon, seasonal fruit, wheat toast' },
      { id: 'mock-281', name: 'Egg White Vegetable Omelette', brandName: 'IHOP', calories: 320, protein: 24, carbs: 18, fat: 18, description: 'Egg whites with mushrooms, spinach, tomatoes' },
      { id: 'mock-282', name: 'Grilled Tilapia', brandName: 'IHOP', calories: 350, protein: 40, carbs: 18, fat: 12, description: 'Grilled tilapia with rice and broccoli' },
      { id: 'mock-283', name: 'Fit Chicken Salad', brandName: 'IHOP', calories: 420, protein: 35, carbs: 28, fat: 20, description: 'Grilled chicken on mixed greens with balsamic' },
    ],
    dennys: [
      { id: 'mock-290', name: 'Fit Fare Veggie Skillet', brandName: "Denny's", calories: 340, protein: 22, carbs: 32, fat: 14, description: 'Egg whites, vegetables, turkey bacon, fruit' },
      { id: 'mock-291', name: 'Fit Slam', brandName: "Denny's", calories: 390, protein: 30, carbs: 38, fat: 14, description: 'Egg whites, turkey bacon, wheat toast, fruit' },
      { id: 'mock-292', name: 'Grilled Chicken Dinner', brandName: "Denny's", calories: 420, protein: 48, carbs: 22, fat: 16, description: 'Grilled chicken breast with vegetables' },
      { id: 'mock-293', name: 'Wild Alaska Salmon', brandName: "Denny's", calories: 450, protein: 42, carbs: 18, fat: 24, description: 'Grilled salmon with rice and broccoli' },
    ],
    "denny's": [
      { id: 'mock-290', name: 'Fit Fare Veggie Skillet', brandName: "Denny's", calories: 340, protein: 22, carbs: 32, fat: 14, description: 'Egg whites, vegetables, turkey bacon, fruit' },
      { id: 'mock-291', name: 'Fit Slam', brandName: "Denny's", calories: 390, protein: 30, carbs: 38, fat: 14, description: 'Egg whites, turkey bacon, wheat toast, fruit' },
      { id: 'mock-292', name: 'Grilled Chicken Dinner', brandName: "Denny's", calories: 420, protein: 48, carbs: 22, fat: 16, description: 'Grilled chicken breast with vegetables' },
      { id: 'mock-293', name: 'Wild Alaska Salmon', brandName: "Denny's", calories: 450, protein: 42, carbs: 18, fat: 24, description: 'Grilled salmon with rice and broccoli' },
    ],
    wafflehouse: [
      { id: 'mock-300', name: 'Grilled Chicken', brandName: 'Waffle House', calories: 280, protein: 42, carbs: 2, fat: 12, description: 'Seasoned grilled chicken breast' },
      { id: 'mock-301', name: 'Egg & Cheese (2 eggs)', brandName: 'Waffle House', calories: 290, protein: 18, carbs: 2, fat: 24, description: 'Two eggs with American cheese' },
      { id: 'mock-302', name: 'Grilled Pork Chop', brandName: 'Waffle House', calories: 380, protein: 45, carbs: 0, fat: 22, description: 'Center-cut grilled pork chop' },
      { id: 'mock-303', name: 'Ham & Cheese Omelet', brandName: 'Waffle House', calories: 420, protein: 28, carbs: 4, fat: 32, description: 'Three-egg omelet with ham and cheese' },
    ],
    'waffle house': [
      { id: 'mock-300', name: 'Grilled Chicken', brandName: 'Waffle House', calories: 280, protein: 42, carbs: 2, fat: 12, description: 'Seasoned grilled chicken breast' },
      { id: 'mock-301', name: 'Egg & Cheese (2 eggs)', brandName: 'Waffle House', calories: 290, protein: 18, carbs: 2, fat: 24, description: 'Two eggs with American cheese' },
      { id: 'mock-302', name: 'Grilled Pork Chop', brandName: 'Waffle House', calories: 380, protein: 45, carbs: 0, fat: 22, description: 'Center-cut grilled pork chop' },
      { id: 'mock-303', name: 'Ham & Cheese Omelet', brandName: 'Waffle House', calories: 420, protein: 28, carbs: 4, fat: 32, description: 'Three-egg omelet with ham and cheese' },
    ],
    crackerbarrel: [
      { id: 'mock-310', name: 'Grilled Chicken Tenderloins', brandName: 'Cracker Barrel', calories: 320, protein: 52, carbs: 6, fat: 10, description: 'Seasoned grilled chicken tenders' },
      { id: 'mock-311', name: 'Lemon Pepper Grilled Rainbow Trout', brandName: 'Cracker Barrel', calories: 380, protein: 42, carbs: 4, fat: 22, description: 'Grilled trout with lemon pepper' },
      { id: 'mock-312', name: 'Grilled Sirloin Steak', brandName: 'Cracker Barrel', calories: 350, protein: 48, carbs: 2, fat: 16, description: '8oz USDA Choice sirloin' },
      { id: 'mock-313', name: 'Farm-Raised Catfish (Grilled)', brandName: 'Cracker Barrel', calories: 290, protein: 32, carbs: 4, fat: 16, description: 'Grilled farm-raised catfish' },
    ],
    'cracker barrel': [
      { id: 'mock-310', name: 'Grilled Chicken Tenderloins', brandName: 'Cracker Barrel', calories: 320, protein: 52, carbs: 6, fat: 10, description: 'Seasoned grilled chicken tenders' },
      { id: 'mock-311', name: 'Lemon Pepper Grilled Rainbow Trout', brandName: 'Cracker Barrel', calories: 380, protein: 42, carbs: 4, fat: 22, description: 'Grilled trout with lemon pepper' },
      { id: 'mock-312', name: 'Grilled Sirloin Steak', brandName: 'Cracker Barrel', calories: 350, protein: 48, carbs: 2, fat: 16, description: '8oz USDA Choice sirloin' },
      { id: 'mock-313', name: 'Farm-Raised Catfish (Grilled)', brandName: 'Cracker Barrel', calories: 290, protein: 32, carbs: 4, fat: 16, description: 'Grilled farm-raised catfish' },
    ],
    // Mexican
    qdoba: [
      { id: 'mock-320', name: 'Protein Bowl (Chicken)', brandName: 'Qdoba', calories: 480, protein: 42, carbs: 32, fat: 22, description: 'Grilled chicken, rice, beans, salsa' },
      { id: 'mock-321', name: 'Grilled Steak Bowl', brandName: 'Qdoba', calories: 520, protein: 38, carbs: 35, fat: 26, description: 'Grilled steak, rice, beans, pico' },
      { id: 'mock-322', name: 'Naked Chicken Burrito', brandName: 'Qdoba', calories: 420, protein: 45, carbs: 28, fat: 18, description: 'Chicken burrito without tortilla' },
      { id: 'mock-323', name: 'Taco Salad (no shell)', brandName: 'Qdoba', calories: 390, protein: 35, carbs: 22, fat: 20, description: 'Chicken, lettuce, beans, salsa' },
    ],
  };

  console.log('getMockSearchResults for:', queryLower);

  // Normalize the query - remove common suffixes and extra words
  const normalizedQuery = queryLower
    .replace(/restaurant|grill|cafe|coffee|drive-in|drive in|kitchen|eatery|bar & grill|bar and grill/gi, '')
    .replace(/[^a-z]/g, '');

  console.log('Normalized query:', normalizedQuery);

  // Find matching mock data - check both directions
  for (const [brand, items] of Object.entries(mockData)) {
    const normalizedBrand = brand.replace(/[^a-z]/g, '');

    // Check if query contains brand OR brand contains significant part of query
    if (normalizedQuery.includes(normalizedBrand) || normalizedBrand.includes(normalizedQuery)) {
      console.log('Found mock data for brand:', brand);
      return items.map(item => ({
        ...item,
        type: 'Brand',
        servingSize: '1 serving',
      }));
    }
  }

  // Second pass - check for partial matches (at least 5 chars matching)
  for (const [brand, items] of Object.entries(mockData)) {
    const normalizedBrand = brand.replace(/[^a-z]/g, '');

    // Check if the first 5+ characters match
    if (normalizedBrand.length >= 5 && normalizedQuery.length >= 5) {
      if (normalizedQuery.startsWith(normalizedBrand.substring(0, 5)) ||
          normalizedBrand.startsWith(normalizedQuery.substring(0, 5))) {
        console.log('Found partial match for brand:', brand);
        return items.map(item => ({
          ...item,
          type: 'Brand',
          servingSize: '1 serving',
        }));
      }
    }
  }

  console.log('No mock data match for:', queryLower);
  // Return empty array to show "No menu items found" message
  return [];
}

// Clear cache (useful for testing or when data should be refreshed)
export function clearCache() {
  responseCache.clear();
}

export default {
  isFatSecretConfigured,
  searchFoods,
  searchRestaurantFoods,
  getFoodDetails,
  getAutocompleteSuggestions,
  clearCache,
};
