/**
 * Unified API Service
 *
 * Combines multiple APIs for a complete restaurant + nutrition solution:
 * - Google Places: Restaurant locations, nearby search, geo-data
 * - FatSecret: Nutrition data (calories, protein, carbs, fat)
 *
 * This layer abstracts the underlying APIs so the app doesn't need to know
 * which service is providing which data.
 */

import {
  searchNearbyRestaurants,
  searchRestaurantChain,
  getPlaceDetails,
  calculateDistance,
  isGooglePlacesConfigured,
} from './googlePlaces';

import {
  searchFoods,
  searchRestaurantFoods,
  getFoodDetails,
  isFatSecretConfigured,
} from './fatSecret';

// Keep legacy exports for backwards compatibility
export * from './nutritionix';
export * from './cache';

// Comprehensive list of restaurant chain brand IDs
// This list determines whether a restaurant is treated as a "chain" (with potential menu data)
// or a "local restaurant" (with AI-estimated nutrition)
const KNOWN_CHAINS = [
  // Fast Food - Burgers
  'mcdonalds', 'burgerking', 'wendys', 'fiveguys', 'innout', 'inandout', 'shakeshack',
  'smashburger', 'whataburger', 'culvers', 'steak n shake', 'steaknshake', 'checkers',
  'rallys', 'carls jr', 'carlsjr', 'hardees', 'jackinthebox', 'jack in the box',
  'white castle', 'whitecastle', 'fatburger', 'johnnyrockets', 'fuddruckers',

  // Fast Food - Chicken
  'chickfila', 'chick-fil-a', 'popeyes', 'kfc', 'kentuckyfriedchicken', 'raisingcanes',
  "raising cane's", 'zaxbys', 'bojangles', 'churchs', "church's chicken", 'wingstop',
  'buffalowildwings', 'buffalo wild wings', 'hooters', 'golden chick', 'slim chickens',
  'el pollo loco', 'elpolloloco',

  // Fast Food - Mexican
  'chipotle', 'tacobell', 'taco bell', 'qdoba', 'moes', "moe's southwest grill",
  'delmaco', 'del taco', 'taco cabana', 'taco bueno', 'chronic tacos', 'tijuana flats',
  'baja fresh', 'rubios', "rubio's", 'torchys', "torchy's tacos",

  // Fast Food - Subs/Sandwiches
  'subway', 'jerseymikes', "jersey mike's", 'jimmyjohns', "jimmy john's", 'firehouse subs',
  'firehousesubs', 'potbelly', 'quiznos', 'arbys', "arby's", 'schlotzskys', 'blimpie',
  'capriottis', "capriotti's", 'penn station', 'which wich', 'whichwich', 'erbert and gerberts',
  'jasons deli', "jason's deli", 'mcalisters', "mcalister's deli",

  // Fast Food - Pizza
  'dominos', "domino's", 'pizzahut', 'pizza hut', 'papajohns', "papa john's", 'littlecaesars',
  "little caesar's", 'marcos', "marco's pizza", 'papa murphys', "papa murphy's", 'cicis',
  "cici's pizza", 'round table pizza', 'jets pizza', "jet's pizza", 'hungry howies',
  "hungry howie's", 'godfathers', "godfather's pizza", 'mod pizza', 'blaze pizza',
  'pieology', '&pizza', 'andpizza',

  // Fast Food - Other
  'sonic', 'sonic drive-in', 'dairyqueen', 'dairy queen', 'auntie annes', "auntie anne's",
  'cinnabon', 'wetzel', "wetzel's pretzels", 'jamba', 'jamba juice', 'smoothie king',
  'tropical smoothie', 'baskin robbins', 'coldstone', 'cold stone',

  // Fast Casual
  'cava', 'sweetgreen', 'panera', 'panera bread', 'noodles', 'noodles and company',
  'panda express', 'pandaexpress', 'pei wei', 'zoes kitchen', "zoe's kitchen",
  'honeygrow', 'corelife', 'corelife eatery', 'dig', 'dig inn', 'tender greens',
  'true food kitchen', 'flower child', 'modern market', 'tocaya', 'sharky', 'chopt',
  'just salad', 'saladworks', 'chopped leaf',

  // Casual Dining
  'applebees', "applebee's", 'chilis', "chili's", 'tgifridays', 'tgi fridays', "friday's",
  'redlobster', 'red lobster', 'olivegarden', 'olive garden', 'outback', 'outback steakhouse',
  'longhorn', 'longhorn steakhouse', 'texas roadhouse', 'texasroadhouse', 'logans roadhouse',
  'cracker barrel', 'crackerbarrel', 'dennys', "denny's", 'ihop', 'waffle house', 'wafflehouse',
  'perkins', 'bobs big boy', "bob's big boy", 'friendly', "friendly's", 'golden corral',
  'hometown buffet', 'old country buffet', 'ruby tuesday', 'rubytuesday', 'oreillys',
  'bennigans', "bennigan's", 'bjs', "bj's restaurant", 'buffalo wild wings', 'hooters',

  // Coffee & Breakfast
  'starbucks', 'dunkin', "dunkin'", 'dunkindonuts', 'peets', "peet's coffee", 'caribou',
  'caribou coffee', 'tim hortons', 'timhortons', 'krispy kreme', 'krispykreme',
  'einstein', 'einstein bros', 'brueggers', "bruegger's", 'au bon pain', 'aubonpain',
  'corner bakery', 'la madeleine', 'le pain quotidien', 'first watch', 'snooze',
  'another broken egg', 'the original pancake house', 'original pancake house',

  // Asian
  'pfchangs', "p.f. chang's", 'pf changs', 'benihana', 'kona grill', 'ra sushi',
  'nobu', 'yard house', 'bonefish grill', 'bonefishgrill', 'seasons 52',

  // Steakhouse
  'ruths chris', "ruth's chris", 'mortons', "morton's", 'capital grille', 'flemings',
  "fleming's", 'smith and wollensky', 'del frisco', "del frisco's", 'stk',
  'the palm', 'palm restaurant', 'mastros', "mastro's",

  // Italian
  'maggianos', "maggiano's", 'carrabas', "carrabba's", 'buca di beppo', 'bucadibeppo',
  'bertuccis', "bertucci's", 'romano', 'romanos macaroni grill', 'macaroni grill',
  'fazolis', "fazoli's", 'sbarro', 'villa italian kitchen',

  // Seafood
  'captain ds', "captain d's", 'long john silvers', "long john silver's", 'joes crab shack',
  "joe's crab shack", 'legal sea foods', 'legalseafoods', 'pappadeaux', 'landry',
  "landry's seafood",

  // Other Chains
  'cheesecake factory', 'cheesecakefactory', 'yard house', 'bjs brewhouse',
  'dave and busters', "dave & buster's", 'main event', 'topgolf', 'cinemark',
  'amc', 'regal', 'alamo drafthouse',

  // Regional Chains (still chains)
  'wawa', 'sheetz', 'racetrac', 'quiktrip', 'buc-ees', 'bucees', "buc-ee's",
  'cookout', 'cook out', 'portillos', "portillo's", 'culvers', "culver's",
  'runza', 'braums', "braum's", 'steak n shake', 'wahlburgers',
];

// Brand ID mapping for restaurant name normalization (maps variations to canonical ID)
const BRAND_MAPPING = {
  'chipotle mexican grill': 'chipotle',
  'chipotle': 'chipotle',
  "chick-fil-a": 'chickfila',
  'chickfila': 'chickfila',
  'cava': 'cava',
  'shake shack': 'shakeshack',
  'shakeshack': 'shakeshack',
  "jersey mike's": 'jerseymikes',
  "jersey mike's subs": 'jerseymikes',
  'jerseymikes': 'jerseymikes',
  'buffalo wild wings': 'buffalowildwings',
  'buffalowildwings': 'buffalowildwings',
  'whataburger': 'whataburger',
  'sonic': 'sonic',
  'sonic drive-in': 'sonic',
  "mcdonald's": 'mcdonalds',
  'mcdonalds': 'mcdonalds',
  'subway': 'subway',
  'taco bell': 'tacobell',
  'tacobell': 'tacobell',
  "wendy's": 'wendys',
  'wendys': 'wendys',
  'panera bread': 'panera',
  'panera': 'panera',
  'starbucks': 'starbucks',
  'sweetgreen': 'sweetgreen',
  "chili's": 'chilis',
  'chilis': 'chilis',
  "applebee's": 'applebees',
  'applebees': 'applebees',
  "papa john's": 'papajohns',
  'papajohns': 'papajohns',
  "domino's": 'dominos',
  'dominos': 'dominos',
  'pizza hut': 'pizzahut',
  'pizzahut': 'pizzahut',
  'olive garden': 'olivegarden',
  'olivegarden': 'olivegarden',
  'red lobster': 'redlobster',
  'redlobster': 'redlobster',
  'outback steakhouse': 'outback',
  'outback': 'outback',
  'texas roadhouse': 'texasroadhouse',
  'texasroadhouse': 'texasroadhouse',
  'cheesecake factory': 'cheesecakefactory',
  'the cheesecake factory': 'cheesecakefactory',
  'cheesecakefactory': 'cheesecakefactory',
  'panda express': 'pandaexpress',
  'pandaexpress': 'pandaexpress',
  "p.f. chang's": 'pfchangs',
  'pf changs': 'pfchangs',
  'pfchangs': 'pfchangs',
  'five guys': 'fiveguys',
  'fiveguys': 'fiveguys',
  'in-n-out': 'innout',
  'in n out': 'innout',
  'innout': 'innout',
  'popeyes': 'popeyes',
  "popeye's": 'popeyes',
  'kfc': 'kfc',
  'kentucky fried chicken': 'kfc',
  'burger king': 'burgerking',
  'burgerking': 'burgerking',
  "denny's": 'dennys',
  'dennys': 'dennys',
  'ihop': 'ihop',
  'waffle house': 'wafflehouse',
  'wafflehouse': 'wafflehouse',
  'dunkin': 'dunkin',
  "dunkin'": 'dunkin',
  'dunkin donuts': 'dunkin',
  'cracker barrel': 'crackerbarrel',
  'crackerbarrel': 'crackerbarrel',
  "arby's": 'arbys',
  'arbys': 'arbys',
  'dairy queen': 'dairyqueen',
  'dairyqueen': 'dairyqueen',
  "little caesar's": 'littlecaesars',
  'little caesars': 'littlecaesars',
  'littlecaesars': 'littlecaesars',
  'qdoba': 'qdoba',
  "jimmy john's": 'jimmyjohns',
  'jimmy johns': 'jimmyjohns',
  'jimmyjohns': 'jimmyjohns',
  'firehouse subs': 'firehousesubs',
  'firehousesubs': 'firehousesubs',
  "raising cane's": 'raisingcanes',
  'raising canes': 'raisingcanes',
  'raisingcanes': 'raisingcanes',
  'wingstop': 'wingstop',
  "zaxby's": 'zaxbys',
  'zaxbys': 'zaxbys',
  'el pollo loco': 'elpolloloco',
  'elpolloloco': 'elpolloloco',
  'del taco': 'deltaco',
  'deltaco': 'deltaco',
  "jack in the box": 'jackinthebox',
  'jackinthebox': 'jackinthebox',
  "carl's jr": 'carlsjr',
  'carls jr': 'carlsjr',
  'carlsjr': 'carlsjr',
  "hardee's": 'hardees',
  'hardees': 'hardees',
  'culvers': 'culvers',
  "culver's": 'culvers',
  'tgi fridays': 'tgifridays',
  "tgi friday's": 'tgifridays',
  'tgifridays': 'tgifridays',
  'ruby tuesday': 'rubytuesday',
  'rubytuesday': 'rubytuesday',
  "bj's restaurant": 'bjs',
  'bjs brewhouse': 'bjs',
  'bjs': 'bjs',
  "logan's roadhouse": 'logansroadhouse',
  'logans roadhouse': 'logansroadhouse',
  'logansroadhouse': 'logansroadhouse',
  'golden corral': 'goldencorral',
  'goldencorral': 'goldencorral',
  "carrabba's": 'carrabbas',
  'carrabbas': 'carrabbas',
  "maggiano's": 'maggianos',
  'maggianos': 'maggianos',
  'longhorn steakhouse': 'longhorn',
  'longhorn': 'longhorn',
  "ruth's chris": 'ruthschris',
  'ruths chris': 'ruthschris',
  'ruthschris': 'ruthschris',
  'first watch': 'firstwatch',
  'firstwatch': 'firstwatch',
  'mod pizza': 'modpizza',
  'modpizza': 'modpizza',
  'blaze pizza': 'blazepizza',
  'blazepizza': 'blazepizza',
  "marco's pizza": 'marcospizza',
  'marcos pizza': 'marcospizza',
  'marcospizza': 'marcospizza',
  'smoothie king': 'smoothieking',
  'smoothieking': 'smoothieking',
  'tropical smoothie': 'tropicalsmoothie',
  'tropical smoothie cafe': 'tropicalsmoothie',
  'tropicalsmoothie': 'tropicalsmoothie',
  'jamba juice': 'jamba',
  'jamba': 'jamba',
  'potbelly': 'potbelly',
  'noodles and company': 'noodles',
  'noodles & company': 'noodles',
  'noodles': 'noodles',
};

/**
 * Get normalized brand ID from restaurant name
 */
export function getBrandId(restaurantName) {
  const normalized = restaurantName.toLowerCase().trim();
  return BRAND_MAPPING[normalized] || normalized.replace(/[^a-z]/g, '');
}

/**
 * Check if a restaurant is a known chain
 * Uses comprehensive KNOWN_CHAINS list plus BRAND_MAPPING
 */
export function isKnownChain(restaurantName) {
  const normalized = restaurantName.toLowerCase().trim();

  // Check if it's in our brand mapping (exact match)
  if (BRAND_MAPPING[normalized]) {
    return true;
  }

  // Clean the name for fuzzy matching
  const normalizedClean = normalized.replace(/[^a-z0-9\s]/g, '').trim();
  const normalizedNoSpaces = normalizedClean.replace(/\s+/g, '');

  // Check against KNOWN_CHAINS list
  for (const chain of KNOWN_CHAINS) {
    const chainClean = chain.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const chainNoSpaces = chainClean.replace(/\s+/g, '');

    // Exact match
    if (normalizedClean === chainClean || normalizedNoSpaces === chainNoSpaces) {
      return true;
    }

    // Check if restaurant name contains the chain name (or vice versa)
    if (normalizedClean.includes(chainClean) || chainClean.includes(normalizedClean)) {
      return true;
    }
    if (normalizedNoSpaces.includes(chainNoSpaces) || chainNoSpaces.includes(normalizedNoSpaces)) {
      return true;
    }
  }

  // Also check brand mapping values
  const knownBrands = Object.values(BRAND_MAPPING);
  return knownBrands.some(brand => {
    const brandClean = brand.toLowerCase().replace(/[^a-z0-9]/g, '');
    return normalizedNoSpaces.includes(brandClean) || brandClean.includes(normalizedNoSpaces);
  });
}

/**
 * Check if APIs are configured
 */
export function getApiStatus() {
  return {
    googlePlaces: isGooglePlacesConfigured(),
    fatSecret: isFatSecretConfigured(),
    isFullyConfigured: isGooglePlacesConfigured() && isFatSecretConfigured(),
  };
}

/**
 * Find nearby restaurants with location data
 *
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Nearby restaurants with distance
 */
export async function findNearbyRestaurants(latitude, longitude, options = {}) {
  const { radius = 5000, keyword = '' } = options;

  const restaurants = await searchNearbyRestaurants(latitude, longitude, radius, keyword);

  // Add distance and brand ID to each restaurant
  return restaurants.map(restaurant => ({
    ...restaurant,
    brandId: getBrandId(restaurant.name),
    distance: restaurant.distance || calculateDistance(
      latitude,
      longitude,
      restaurant.latitude,
      restaurant.longitude
    ),
    distanceText: formatDistance(restaurant.distance || calculateDistance(
      latitude,
      longitude,
      restaurant.latitude,
      restaurant.longitude
    )),
  }));
}

/**
 * Get menu items for a restaurant with nutrition data
 *
 * @param {string} restaurantName - Name of restaurant
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Menu items with nutrition
 */
export async function getRestaurantMenu(restaurantName, options = {}) {
  const { query = '', limit = 30 } = options;

  const items = await searchRestaurantFoods(restaurantName, query);

  // Sort by relevance (items with brand name matching restaurant first)
  const brandId = getBrandId(restaurantName);

  return items
    .slice(0, limit)
    .map(item => ({
      ...item,
      brandId,
      restaurant: restaurantName,
    }));
}

/**
 * Search for a specific food item across all restaurants
 *
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Matching food items
 */
export async function searchAllFoods(query, options = {}) {
  const { limit = 20 } = options;

  const results = await searchFoods(query, limit);

  return results.map(item => ({
    ...item,
    brandId: item.brandName ? getBrandId(item.brandName) : null,
    restaurant: item.brandName,
  }));
}

/**
 * Get combined restaurant data (location + menu)
 *
 * @param {string} restaurantName - Restaurant name
 * @param {number} latitude - Optional: user's latitude for distance
 * @param {number} longitude - Optional: user's longitude for distance
 * @returns {Promise<Object>} Restaurant with location and menu
 */
export async function getRestaurantWithMenu(restaurantName, latitude, longitude) {
  // Fetch location and menu in parallel
  const [locations, menuItems] = await Promise.all([
    latitude && longitude
      ? searchRestaurantChain(restaurantName, latitude, longitude)
      : Promise.resolve([]),
    getRestaurantMenu(restaurantName),
  ]);

  const nearestLocation = locations[0] || null;

  return {
    name: restaurantName,
    brandId: getBrandId(restaurantName),
    location: nearestLocation,
    distance: nearestLocation?.distance || null,
    distanceText: nearestLocation ? formatDistance(nearestLocation.distance) : null,
    address: nearestLocation?.address || null,
    isOpen: nearestLocation?.isOpen || null,
    rating: nearestLocation?.rating || null,
    menuItems,
    menuCount: menuItems.length,
  };
}

/**
 * Check if a restaurant chain has a location within the specified radius
 * Used for filtering HomeScreen categories by nearby availability
 *
 * @param {string} chainName - Name of restaurant chain
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} radiusMiles - Search radius in miles (default 30)
 * @returns {Promise<boolean>} True if chain has nearby location
 */
export async function checkChainNearby(chainName, latitude, longitude, radiusMiles = 30) {
  if (!latitude || !longitude) {
    // If no location, assume all chains are available
    return true;
  }

  // Convert miles to meters for Google Places API
  const radiusMeters = radiusMiles * 1609.34;

  try {
    const results = await searchRestaurantChain(chainName, latitude, longitude, radiusMeters);
    return results && results.length > 0;
  } catch (error) {
    console.error(`Error checking chain availability for ${chainName}:`, error);
    // On error, assume chain is NOT available to be safe
    return false;
  }
}

/**
 * Check multiple chains for nearby availability
 * Batches requests for efficiency
 *
 * @param {string[]} chainNames - Array of chain names to check
 * @param {number} latitude - User's latitude
 * @param {number} longitude - User's longitude
 * @param {number} radiusMiles - Search radius in miles (default 30)
 * @returns {Promise<Object>} Map of chain name to availability boolean
 */
export async function checkChainsNearby(chainNames, latitude, longitude, radiusMiles = 30) {
  if (!latitude || !longitude) {
    // If no location, all chains are "available"
    const result = {};
    chainNames.forEach(name => { result[name] = true; });
    return result;
  }

  // Check all chains in parallel
  const results = await Promise.all(
    chainNames.map(async (name) => {
      const isNearby = await checkChainNearby(name, latitude, longitude, radiusMiles);
      return { name, isNearby };
    })
  );

  // Convert to object map
  const availabilityMap = {};
  results.forEach(({ name, isNearby }) => {
    availabilityMap[name] = isNearby;
  });

  return availabilityMap;
}

/**
 * Format distance as readable string
 */
function formatDistance(miles) {
  if (miles === null || miles === undefined) return null;

  if (miles < 0.1) {
    return 'Nearby';
  } else if (miles < 1) {
    return `${(miles * 5280).toFixed(0)} ft`;
  } else {
    return `${miles.toFixed(1)} mi`;
  }
}

// Re-export individual API functions for direct access if needed
export {
  // Google Places
  searchNearbyRestaurants,
  searchRestaurantChain,
  getPlaceDetails,
  calculateDistance,
  isGooglePlacesConfigured,

  // FatSecret
  searchFoods,
  searchRestaurantFoods,
  getFoodDetails,
  isFatSecretConfigured,
};
