import { supabase } from '@/lib/supabase';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export function guessMealType(date = new Date()): MealType {
  const h = date.getHours();
  if (h < 11) return 'breakfast';
  if (h < 16) return 'lunch';
  if (h < 21) return 'dinner';
  return 'snack';
}

/** A food item as the user edits it. Numbers are kept as text so inputs can be cleared while typing. */
export type FoodDraft = {
  id: string;
  name: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
};

export type Totals = { calories: number; protein: number; carbs: number; fat: number };

/** One row of the food_logs table. */
export type FoodLog = {
  id: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  created_at: string;
};

export function createFoodDraft(item?: Partial<Omit<FoodDraft, 'id'>>): FoodDraft {
  return {
    id: Math.random().toString(36).slice(2),
    name: item?.name ?? '',
    calories: item?.calories ?? '',
    protein: item?.protein ?? '',
    carbs: item?.carbs ?? '',
    fat: item?.fat ?? '',
  };
}

export function toNumber(value: string) {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : 0;
}

export function sumTotals(items: FoodDraft[]): Totals {
  return items.reduce<Totals>(
    (totals, item) => ({
      calories: totals.calories + toNumber(item.calories),
      protein: totals.protein + toNumber(item.protein),
      carbs: totals.carbs + toNumber(item.carbs),
      fat: totals.fat + toNumber(item.fat),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

const SCAN_URL = process.env.EXPO_PUBLIC_N8N_SCAN_URL;
const SCAN_SECRET = process.env.EXPO_PUBLIC_N8N_SECRET;

type ScannedItem = { name?: unknown; calories?: unknown; protein?: unknown; carbs?: unknown; fat?: unknown };

/**
 * Sends the photo to the n8n webhook. The webhook should respond with
 * `{ "foods": [{ "name", "calories", "protein", "carbs", "fat" }] }` (or `items`, or a bare array).
 */
export async function analyzeMealPhoto(base64: string, mimeType: string): Promise<FoodDraft[]> {
  if (!SCAN_URL) {
    throw new Error('Scan URL is missing. Add EXPO_PUBLIC_N8N_SCAN_URL to .env.');
  }

  const response = await fetch(SCAN_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-webhook-secret': SCAN_SECRET ?? '',
    },
    body: JSON.stringify({ image: base64, mimeType }),
  });

  const body = await response.text();
  console.log('scan response', response.status, body);
  if (!response.ok) {
    throw new Error('Could not analyze the photo. Try again or add items manually.');
  }

  const data = JSON.parse(body);
  const scanned: ScannedItem[] = Array.isArray(data) ? data : (data?.foods ?? data?.items ?? []);

  return scanned
    .filter((item) => typeof item.name === 'string' && item.name.trim() !== '')
    .map((item) =>
      createFoodDraft({
        name: String(item.name),
        calories: String(Number(item.calories) || 0),
        protein: String(Number(item.protein) || 0),
        carbs: String(Number(item.carbs) || 0),
        fat: String(Number(item.fat) || 0),
      }),
    );
}

export function sumFoodLogs(logs: FoodLog[]): Totals {
  return logs.reduce<Totals>(
    (totals, log) => ({
      calories: totals.calories + log.calories,
      protein: totals.protein + log.protein,
      carbs: totals.carbs + log.carbs,
      fat: totals.fat + log.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/** Local calendar day as YYYY-MM-DD, so entries can be grouped by the day the user lived it. */
export function localDayKey(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Food rows logged in the last `days` local days, today included, newest first. Row-level security limits this to the signed-in user. */
export async function fetchRecentFoodLogs(days: number): Promise<FoodLog[]> {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('food_logs')
    .select('id, food_name, calories, protein, carbs, fat, created_at')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Could not load your food history.');
  }

  return (data ?? []) as FoodLog[];
}

const foodLogListeners = new Set<() => void>();

/** Lets screens reload their food logs as soon as a meal is saved, whatever tab is showing. */
export function subscribeToFoodLogChanges(listener: () => void) {
  foodLogListeners.add(listener);
  return () => {
    foodLogListeners.delete(listener);
  };
}

/** Saves each food item as its own food_logs row. */
export async function saveMeal(items: FoodDraft[], mealType: MealType = guessMealType()) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('Please log in again to save your meal.');
  }

  const { error } = await supabase.from('food_logs').insert(
    items.map((item) => ({
      user_id: userId,
      food_name: item.name.trim(),
      calories: toNumber(item.calories),
      protein: toNumber(item.protein),
      carbs: toNumber(item.carbs),
      fat: toNumber(item.fat),
      quantity: 1,
      meal_type: mealType,
    })),
  );

  if (error) {
    throw new Error(`Could not save the meal: ${error.message}`);
  }

  foodLogListeners.forEach((listener) => listener());
}
