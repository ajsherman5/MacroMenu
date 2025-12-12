# MacroMenu - Project Context & Development Notes

## Project Overview

**MacroMenu** is a React Native (Expo) mobile app that helps users find restaurant meals matching their fitness goals (bulk, cut, maintain). The app provides AI-powered meal recommendations with real nutrition data from restaurant menus.

## Tech Stack

- **Framework**: React Native with Expo
- **State Management**: React Context (AuthContext, UserContext, OnboardingContext)
- **Backend**: Supabase (authentication, database) - *code written, not yet configured*
- **Nutrition API**: Nutritionix API - *code written, not yet configured*
- **Storage**: AsyncStorage (local), expo-secure-store (secure tokens)
- **Navigation**: React Navigation (stack navigator)

## Project Structure

```
MacroMenu/
├── src/
│   ├── components/          # Reusable UI components
│   │   └── OnboardingLayout.js
│   ├── context/             # React Context providers
│   │   ├── AuthContext.js   # Authentication state
│   │   ├── UserContext.js   # User preferences/data
│   │   └── OnboardingContext.js
│   ├── screens/
│   │   ├── onboarding/      # 20-screen onboarding flow
│   │   │   ├── WelcomeScreen.js
│   │   │   ├── GoalScreen.js
│   │   │   ├── GenderScreen.js
│   │   │   ├── AgeScreen.js
│   │   │   ├── HeightScreen.js
│   │   │   ├── WeightScreen.js
│   │   │   ├── TargetWeightScreen.js
│   │   │   ├── TimelineScreen.js
│   │   │   ├── ActivityLevelScreen.js
│   │   │   ├── DietTypeScreen.js
│   │   │   ├── HardestPartScreen.js
│   │   │   ├── EveryRestaurantScreen.js
│   │   │   ├── FavoriteSpotsScreen.js
│   │   │   ├── FoodLikesScreen.js
│   │   │   └── ... more screens
│   │   └── main/            # Post-onboarding screens
│   ├── services/
│   │   ├── api/
│   │   │   └── nutritionix.js  # Nutritionix API client
│   │   └── supabase/
│   │       ├── config.js       # Supabase client setup
│   │       └── index.js        # Auth functions
│   └── utils/
│       └── calculations.js     # TDEE/BMR calculations
├── assets/
│   └── logos/               # Restaurant logo images
└── App.js                   # Root component
```

## Current Implementation Status

### Completed (Code Written)
- Full 20-screen onboarding flow
- User profile collection (age, height, weight, goals)
- TDEE/BMR calculations based on activity level
- Goal-specific UI (bulk/cut/maintain variations)
- Restaurant selection screens with 8 premium casual logos
- Nutritionix API client with all functions
- Supabase auth client with fallback to guest mode
- Deep linking utilities for DoorDash/Uber Eats

### Needs Configuration (Tomorrow)
1. **Nutritionix API** - Sign up at https://developer.nutritionix.com
   - Get App ID and API Key
   - Add to `.env` file:
     ```
     EXPO_PUBLIC_NUTRITIONIX_APP_ID=your_app_id
     EXPO_PUBLIC_NUTRITIONIX_API_KEY=your_api_key
     ```

2. **Supabase** (Optional - guest mode works without it)
   - Create project at https://supabase.com
   - Add to `.env` file:
     ```
     EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
     EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```

### Not Yet Built
- Main app screens (post-onboarding)
- Meal recommendation algorithm
- Restaurant menu browsing
- Meal logging/tracking
- RevenueCat subscription integration
- App Store preparation

## Restaurant Logos (8 Premium Casual Chains)

Current logos in `assets/logos/`:
1. chipotle.png
2. shakeshack.png
3. jerseysmikes.png (note: typo in filename)
4. whataburger.png
5. buffalowildwings.png
6. sonic.png
7. chickfila.png
8. Cava-Logo.png

Used in: `EveryRestaurantScreen.js` and `FavoriteSpotsScreen.js`

## Key Files Modified Today (Dec 12, 2024)

### 1. `src/services/supabase/config.js`
- Added `isSupabaseConfigured` check to prevent errors when no `.env` exists
- Returns `null` for supabase client if not configured

### 2. `src/context/AuthContext.js`
- Imports `isSupabaseConfigured` flag
- Conditionally loads Supabase modules only when configured
- Falls back to mock authentication for development/guest mode

### 3. `src/screens/onboarding/FavoriteSpotsScreen.js`
- Updated logo imports to match current 8 restaurants
- Removed references to deleted logos (wendys, panera, etc.)

### 4. `src/screens/onboarding/HardestPartScreen.js`
- Made top button text dynamic based on goal:
  - Bulk: "Finding high-calorie affordable meals"
  - Cut: "Finding low-calorie affordable meals"
  - Maintain: "Finding calorie-conscious affordable meals"

## Nutritionix API Details

The `src/services/api/nutritionix.js` file contains:

### Functions
- `searchBrandedFoods(query, brandId)` - Search restaurant foods
- `getFoodDetails(nixItemId)` - Get detailed nutrition info
- `searchRestaurants(query, lat, lng)` - Find restaurant locations
- `getRestaurantMenu(brandId)` - Get all menu items for a brand
- `parseNaturalQuery(query)` - Parse "I ate a chipotle bowl with chicken"
- `searchMenuItems({restaurantName, query, maxCalories, minProtein})` - Search with filters
- `transformFoodItem(item)` - Convert API response to app format

### Brand IDs (POPULAR_BRANDS)
```javascript
{
  chipotle: '513fbc1283aa2dc80c000020',
  mcdonalds: '513fbc1283aa2dc80c000053',
  subway: '513fbc1283aa2dc80c000048',
  chickfila: '513fbc1283aa2dc80c00002b',
  wendys: '513fbc1283aa2dc80c000061',
  tacobell: '513fbc1283aa2dc80c000050',
  panera: '513fbc1283aa2dc80c000035',
  starbucks: '513fbc1283aa2dc80c000045',
  shakeshack: '5a8ec1e9bb44570006e70e04',
  buffalowildwings: '513fbc1283aa2dc80c00001a',
  sonic: '513fbc1283aa2dc80c000044',
  cava: '5886c0c0ba6d0d9d5d0d2dbf',
  jerseyMikes: '5412fc74c30e14c12e003e49',
  whataburger: '5411e26bc30e14c12e001bb6',
}
```

## Running the App

```bash
cd /Users/ajsherman/PycharmProjects/MacroMenu/MacroMenu
npx expo start --port 8085
```

Note: Port 8081 is often in use by TaskPlant app.

## Competitor Analysis: MenuFit

- Uses AI-generated meal images (not real photos)
- Custom meal names (e.g., "Protein Surge" not "Grilled Chicken Salad")
- Deep links to DoorDash/Uber Eats for ordering
- Monetization via delivery app affiliate links

## Deep Linking Strategy

Can link directly to restaurants in delivery apps:
- DoorDash: `doordash://store/{store_id}`
- Uber Eats: `ubereats://restaurant/{restaurant_id}`
- Google Maps: `comgooglemaps://?q={restaurant_name}`
- Apple Maps: `maps://?q={restaurant_name}`

Cart injection (pre-adding items) requires partner API access.

## Tomorrow's Priorities

1. Configure Nutritionix API with real credentials
2. Test API integration with actual restaurant data
3. Build main app screens (meal recommendations, browsing)
4. Implement match score algorithm for meal ranking

## Session Notes

### Dec 12, 2024 - Session 1 (Main Computer)
- Modified HardestPartScreen for goal-specific text
- Replaced fast food logos with premium casual chains
- Created CLAUDE.md and pushed to GitHub
- Discussed competitor (MenuFit) features and monetization

### Dec 12, 2024 - Session 2 (Different Device)
- Pulled from GitHub, encountered missing dependencies
- Installed expo-secure-store
- Fixed FavoriteSpotsScreen broken logo imports
- Fixed Supabase URL error by adding configuration bypass
- Verified app runs without API keys (guest mode)
- Clarified what's actually implemented vs. what needs API keys
