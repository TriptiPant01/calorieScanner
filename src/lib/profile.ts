import { supabase } from '@/lib/supabase';

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const;

export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'active', label: 'Active' },
] as const;

export const GOALS = [
  { value: 'lose', label: 'Lose weight' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'gain', label: 'Gain weight' },
] as const;

export type Gender = (typeof GENDERS)[number]['value'];
export type ActivityLevel = (typeof ACTIVITY_LEVELS)[number]['value'];
export type Goal = (typeof GOALS)[number]['value'];

/** Profile fields as the form edits them. Numbers stay as text so inputs can be cleared while typing. */
export type ProfileForm = {
  fullName: string;
  age: string;
  heightCm: string;
  weightKg: string;
  gender: Gender | null;
  activityLevel: ActivityLevel | null;
  goal: Goal | null;
};

export const EMPTY_PROFILE_FORM: ProfileForm = {
  fullName: '',
  age: '',
  heightCm: '',
  weightKg: '',
  gender: null,
  activityLevel: null,
  goal: null,
};

type ProfileRow = {
  full_name: string | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  gender: Gender | null;
  activity_level: ActivityLevel | null;
  goal: Goal | null;
};

export function validateProfileForm(form: ProfileForm): string | null {
  if (!form.fullName.trim()) {
    return 'Enter your name.';
  }

  const age = Number(form.age);
  if (!Number.isInteger(age) || age < 10 || age > 120) {
    return 'Enter a valid age between 10 and 120.';
  }

  const height = Number(form.heightCm);
  if (!(height >= 50 && height <= 250)) {
    return 'Enter a valid height in cm (50–250).';
  }

  const weight = Number(form.weightKg);
  if (!(weight >= 20 && weight <= 300)) {
    return 'Enter a valid weight in kg (20–300).';
  }

  if (!form.gender || !form.activityLevel || !form.goal) {
    return 'Choose your gender, activity level and goal.';
  }

  return null;
}

function toForm(row: ProfileRow): ProfileForm {
  return {
    fullName: row.full_name ?? '',
    age: row.age?.toString() ?? '',
    heightCm: row.height_cm?.toString() ?? '',
    weightKg: row.weight_kg?.toString() ?? '',
    gender: row.gender,
    activityLevel: row.activity_level,
    goal: row.goal,
  };
}

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  if (!userId) {
    throw new Error('Please log in again.');
  }
  return userId;
}

/** Returns the signed-in user's saved profile, or null if they have not filled it in yet. */
export async function fetchProfile(): Promise<ProfileForm | null> {
  const userId = await currentUserId();

  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, age, height_cm, weight_kg, gender, activity_level, goal')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Could not load your profile: ${error.message}`);
  }

  return data ? toForm(data as ProfileRow) : null;
}

export async function saveProfile(form: ProfileForm) {
  const userId = await currentUserId();

  const { error } = await supabase.from('profiles').upsert(
    {
      id: userId,
      full_name: form.fullName.trim(),
      age: Number(form.age),
      height_cm: Number(form.heightCm),
      weight_kg: Number(form.weightKg),
      gender: form.gender,
      activity_level: form.activityLevel,
      goal: form.goal,
    },
    { onConflict: 'id' },
  );

  if (error) {
    throw new Error(`Could not save your profile: ${error.message}`);
  }
}
