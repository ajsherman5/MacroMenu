/**
 * Supabase Database Service
 * Handles syncing user profile and preferences to the cloud
 *
 * SUPABASE SETUP REQUIRED:
 * Run this SQL in your Supabase SQL Editor to create the user_profiles table:
 *
 * ```sql
 * -- Create user_profiles table
 * CREATE TABLE user_profiles (
 *   id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 *
 *   -- Profile data
 *   goal TEXT, -- 'bulk', 'cut', 'maintain'
 *   gender TEXT,
 *   height INTEGER, -- in inches
 *   current_weight INTEGER,
 *   goal_weight INTEGER,
 *   timeline TEXT,
 *   activity_level TEXT,
 *   eating_style TEXT,
 *   days_eating_out TEXT,
 *
 *   -- Macros (calculated)
 *   calories INTEGER,
 *   protein INTEGER,
 *   carbs INTEGER,
 *   fat INTEGER,
 *
 *   -- Preferences (stored as JSONB)
 *   favorite_restaurants JSONB DEFAULT '[]',
 *   food_likes JSONB DEFAULT '{"cuisines":[],"entrees":[],"proteins":[],"sides":[],"flavors":[]}',
 *   food_dislikes JSONB DEFAULT '{"cuisines":[],"entrees":[],"proteins":[],"sides":[],"flavors":[]}',
 *
 *   -- Restrictions
 *   allergies JSONB DEFAULT '[]',
 *   dietary_preferences JSONB DEFAULT '[]',
 *
 *   -- Recent activity
 *   recent_restaurants JSONB DEFAULT '[]',
 *
 *   -- Metadata
 *   onboarding_complete BOOLEAN DEFAULT FALSE,
 *   created_at TIMESTAMPTZ DEFAULT NOW(),
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * -- Enable RLS (Row Level Security)
 * ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
 *
 * -- Create policy: Users can only read/write their own data
 * CREATE POLICY "Users can view own profile" ON user_profiles
 *   FOR SELECT USING (auth.uid() = id);
 *
 * CREATE POLICY "Users can insert own profile" ON user_profiles
 *   FOR INSERT WITH CHECK (auth.uid() = id);
 *
 * CREATE POLICY "Users can update own profile" ON user_profiles
 *   FOR UPDATE USING (auth.uid() = id);
 *
 * -- Create function to auto-update updated_at
 * CREATE OR REPLACE FUNCTION update_updated_at()
 * RETURNS TRIGGER AS $$
 * BEGIN
 *   NEW.updated_at = NOW();
 *   RETURN NEW;
 * END;
 * $$ LANGUAGE plpgsql;
 *
 * -- Create trigger for updated_at
 * CREATE TRIGGER user_profiles_updated_at
 *   BEFORE UPDATE ON user_profiles
 *   FOR EACH ROW
 *   EXECUTE FUNCTION update_updated_at();
 *
 * -- Create function to auto-create profile on user signup
 * CREATE OR REPLACE FUNCTION handle_new_user()
 * RETURNS TRIGGER AS $$
 * BEGIN
 *   INSERT INTO public.user_profiles (id)
 *   VALUES (NEW.id);
 *   RETURN NEW;
 * END;
 * $$ LANGUAGE plpgsql SECURITY DEFINER;
 *
 * -- Create trigger for new user signup
 * CREATE TRIGGER on_auth_user_created
 *   AFTER INSERT ON auth.users
 *   FOR EACH ROW
 *   EXECUTE FUNCTION handle_new_user();
 * ```
 */

import { supabase, isSupabaseConfigured } from './config';

/**
 * Convert app's camelCase user object to database snake_case
 */
function toDbFormat(userData) {
  return {
    // Profile
    goal: userData.profile?.goal || null,
    gender: userData.profile?.gender || null,
    height: userData.profile?.height || null,
    current_weight: userData.profile?.currentWeight || null,
    goal_weight: userData.profile?.goalWeight || null,
    timeline: userData.profile?.timeline || null,
    activity_level: userData.profile?.activityLevel || null,
    eating_style: userData.profile?.eatingStyle || null,
    days_eating_out: userData.profile?.daysEatingOut || null,

    // Macros
    calories: userData.macros?.calories || null,
    protein: userData.macros?.protein || null,
    carbs: userData.macros?.carbs || null,
    fat: userData.macros?.fat || null,

    // Preferences (stored as JSONB)
    favorite_restaurants: userData.preferences?.favoriteRestaurants || [],
    food_likes: userData.preferences?.foodLikes || {
      cuisines: [],
      entrees: [],
      proteins: [],
      sides: [],
      flavors: [],
    },
    food_dislikes: userData.preferences?.foodDislikes || {
      cuisines: [],
      entrees: [],
      proteins: [],
      sides: [],
      flavors: [],
    },

    // Restrictions
    allergies: userData.restrictions?.allergies || [],
    dietary_preferences: userData.restrictions?.dietaryPreferences || [],

    // Recent
    recent_restaurants: userData.recentRestaurants || [],

    // Status
    onboarding_complete: userData.onboardingComplete || false,
  };
}

/**
 * Convert database snake_case to app's camelCase format
 */
function fromDbFormat(dbData) {
  if (!dbData) return null;

  return {
    profile: {
      goal: dbData.goal,
      gender: dbData.gender,
      height: dbData.height,
      currentWeight: dbData.current_weight,
      goalWeight: dbData.goal_weight,
      timeline: dbData.timeline,
      activityLevel: dbData.activity_level,
      eatingStyle: dbData.eating_style,
      daysEatingOut: dbData.days_eating_out,
    },
    macros: {
      calories: dbData.calories,
      protein: dbData.protein,
      carbs: dbData.carbs,
      fat: dbData.fat,
    },
    preferences: {
      favoriteRestaurants: dbData.favorite_restaurants || [],
      foodLikes: dbData.food_likes || {
        cuisines: [],
        entrees: [],
        proteins: [],
        sides: [],
        flavors: [],
      },
      foodDislikes: dbData.food_dislikes || {
        cuisines: [],
        entrees: [],
        proteins: [],
        sides: [],
        flavors: [],
      },
    },
    restrictions: {
      allergies: dbData.allergies || [],
      dietaryPreferences: dbData.dietary_preferences || [],
    },
    recentRestaurants: dbData.recent_restaurants || [],
    onboardingComplete: dbData.onboarding_complete || false,
  };
}

/**
 * Fetch user profile from Supabase
 * @param {string} userId - The user's UUID from auth
 * @returns {Promise<Object|null>} User data in app format, or null if not found
 */
export async function fetchUserProfile(userId) {
  if (!isSupabaseConfigured || !supabase) {
    console.log('[Database] Supabase not configured, skipping cloud fetch');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // PGRST116 = no rows found, which is fine for new users
      if (error.code === 'PGRST116') {
        console.log('[Database] No profile found for user, will create on save');
        return null;
      }
      console.error('[Database] Error fetching profile:', error);
      return null;
    }

    console.log('[Database] Profile fetched successfully');
    return fromDbFormat(data);
  } catch (error) {
    console.error('[Database] Error fetching profile:', error);
    return null;
  }
}

/**
 * Save user profile to Supabase (upsert - insert or update)
 * @param {string} userId - The user's UUID from auth
 * @param {Object} userData - User data in app format
 * @returns {Promise<boolean>} Success status
 */
export async function saveUserProfile(userId, userData) {
  if (!isSupabaseConfigured || !supabase) {
    console.log('[Database] Supabase not configured, skipping cloud save');
    return false;
  }

  try {
    // Check current auth session
    const { data: { session } } = await supabase.auth.getSession();
    console.log('[Database] Current session user:', session?.user?.id);
    console.log('[Database] Trying to save for userId:', userId);

    if (!session) {
      console.error('[Database] No active session - cannot save');
      return false;
    }

    if (session.user.id !== userId) {
      console.error('[Database] Session user ID does not match provided userId');
      return false;
    }

    const dbData = toDbFormat(userData);

    // Use update instead of upsert since row should already exist
    const { error } = await supabase
      .from('user_profiles')
      .update(dbData)
      .eq('id', userId);

    if (error) {
      console.error('[Database] Error saving profile:', error);
      return false;
    }

    console.log('[Database] Profile saved successfully');
    return true;
  } catch (error) {
    console.error('[Database] Error saving profile:', error);
    return false;
  }
}

/**
 * Update specific fields of user profile
 * @param {string} userId - The user's UUID from auth
 * @param {Object} updates - Partial user data to update (in app format)
 * @returns {Promise<boolean>} Success status
 */
export async function updateUserProfile(userId, updates) {
  if (!isSupabaseConfigured || !supabase) {
    console.log('[Database] Supabase not configured, skipping cloud update');
    return false;
  }

  try {
    // Convert only the provided fields
    const dbUpdates = {};

    if (updates.profile) {
      if (updates.profile.goal !== undefined) dbUpdates.goal = updates.profile.goal;
      if (updates.profile.gender !== undefined) dbUpdates.gender = updates.profile.gender;
      if (updates.profile.height !== undefined) dbUpdates.height = updates.profile.height;
      if (updates.profile.currentWeight !== undefined) dbUpdates.current_weight = updates.profile.currentWeight;
      if (updates.profile.goalWeight !== undefined) dbUpdates.goal_weight = updates.profile.goalWeight;
      if (updates.profile.timeline !== undefined) dbUpdates.timeline = updates.profile.timeline;
      if (updates.profile.activityLevel !== undefined) dbUpdates.activity_level = updates.profile.activityLevel;
      if (updates.profile.eatingStyle !== undefined) dbUpdates.eating_style = updates.profile.eatingStyle;
      if (updates.profile.daysEatingOut !== undefined) dbUpdates.days_eating_out = updates.profile.daysEatingOut;
    }

    if (updates.macros) {
      if (updates.macros.calories !== undefined) dbUpdates.calories = updates.macros.calories;
      if (updates.macros.protein !== undefined) dbUpdates.protein = updates.macros.protein;
      if (updates.macros.carbs !== undefined) dbUpdates.carbs = updates.macros.carbs;
      if (updates.macros.fat !== undefined) dbUpdates.fat = updates.macros.fat;
    }

    if (updates.preferences) {
      if (updates.preferences.favoriteRestaurants !== undefined) {
        dbUpdates.favorite_restaurants = updates.preferences.favoriteRestaurants;
      }
      if (updates.preferences.foodLikes !== undefined) {
        dbUpdates.food_likes = updates.preferences.foodLikes;
      }
      if (updates.preferences.foodDislikes !== undefined) {
        dbUpdates.food_dislikes = updates.preferences.foodDislikes;
      }
    }

    if (updates.restrictions) {
      if (updates.restrictions.allergies !== undefined) {
        dbUpdates.allergies = updates.restrictions.allergies;
      }
      if (updates.restrictions.dietaryPreferences !== undefined) {
        dbUpdates.dietary_preferences = updates.restrictions.dietaryPreferences;
      }
    }

    if (updates.recentRestaurants !== undefined) {
      dbUpdates.recent_restaurants = updates.recentRestaurants;
    }

    if (updates.onboardingComplete !== undefined) {
      dbUpdates.onboarding_complete = updates.onboardingComplete;
    }

    const { error } = await supabase
      .from('user_profiles')
      .update(dbUpdates)
      .eq('id', userId);

    if (error) {
      console.error('[Database] Error updating profile:', error);
      return false;
    }

    console.log('[Database] Profile updated successfully');
    return true;
  } catch (error) {
    console.error('[Database] Error updating profile:', error);
    return false;
  }
}

/**
 * Delete user profile (for account deletion)
 * @param {string} userId - The user's UUID from auth
 * @returns {Promise<boolean>} Success status
 */
export async function deleteUserProfile(userId) {
  if (!isSupabaseConfigured || !supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('[Database] Error deleting profile:', error);
      return false;
    }

    console.log('[Database] Profile deleted successfully');
    return true;
  } catch (error) {
    console.error('[Database] Error deleting profile:', error);
    return false;
  }
}
