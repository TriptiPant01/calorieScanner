import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthField } from '@/components/auth/auth-field';
import { LoadingOverlay } from '@/components/loading-overlay';
import { BottomTabInset, BrandColors, Spacing } from '@/constants/theme';
import {
  ACTIVITY_LEVELS,
  EMPTY_PROFILE_FORM,
  GENDERS,
  GOALS,
  fetchProfile,
  saveProfile,
  validateProfileForm,
  type ProfileForm,
} from '@/lib/profile';

export default function ProfileScreen() {
  const [form, setForm] = useState<ProfileForm>(EMPTY_PROFILE_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = loading || saving;

  useEffect(() => {
    fetchProfile()
      .then((profile) => {
        if (profile) {
          setForm(profile);
        }
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : 'Something went wrong.');
      })
      .finally(() => setLoading(false));
  }, []);

  function update<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    const validationError = validateProfileForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await saveProfile(form);
      Alert.alert('Profile saved', 'Your details have been updated.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Your profile</Text>
            <Text style={styles.subtitle}>Keep your details up to date.</Text>

            <AuthField
              label="Full name"
              icon={{ ios: 'person', android: 'person', web: 'person' }}
              placeholder="Your name"
              autoCapitalize="words"
              textContentType="name"
              editable={!busy}
              value={form.fullName}
              onChangeText={(value) => update('fullName', value)}
            />
            <View style={styles.row}>
              <View style={styles.half}>
                <AuthField
                  label="Age"
                  icon={{ ios: 'birthday.cake', android: 'cake', web: 'cake' }}
                  placeholder="Years"
                  keyboardType="number-pad"
                  editable={!busy}
                  value={form.age}
                  onChangeText={(value) => update('age', value)}
                />
              </View>
              <View style={styles.half}>
                <AuthField
                  label="Height (cm)"
                  icon={{ ios: 'ruler', android: 'straighten', web: 'straighten' }}
                  placeholder="cm"
                  keyboardType="decimal-pad"
                  editable={!busy}
                  value={form.heightCm}
                  onChangeText={(value) => update('heightCm', value)}
                />
              </View>
            </View>
            <AuthField
              label="Weight (kg)"
              icon={{ ios: 'scalemass', android: 'monitor_weight', web: 'monitor_weight' }}
              placeholder="kg"
              keyboardType="decimal-pad"
              editable={!busy}
              value={form.weightKg}
              onChangeText={(value) => update('weightKg', value)}
            />

            <Text style={styles.label}>Gender</Text>
            <OptionGroup
              options={GENDERS}
              value={form.gender}
              disabled={busy}
              onChange={(v) => update('gender', v)}
            />

            <Text style={styles.label}>Activity level</Text>
            <OptionGroup
              options={ACTIVITY_LEVELS}
              value={form.activityLevel}
              disabled={busy}
              onChange={(v) => update('activityLevel', v)}
            />

            <Text style={styles.label}>Goal</Text>
            <OptionGroup
              options={GOALS}
              value={form.goal}
              disabled={busy}
              onChange={(v) => update('goal', v)}
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <AuthButton
              label={saving ? 'Saving...' : 'Save profile'}
              onPress={handleSave}
              disabled={busy}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <LoadingOverlay
        visible={busy}
        message={loading ? 'Loading your profile...' : 'Saving your profile...'}
      />
    </View>
  );
}

type OptionGroupProps<T extends string> = {
  options: readonly { value: T; label: string }[];
  value: T | null;
  disabled: boolean;
  onChange: (value: T) => void;
};

function OptionGroup<T extends string>({ options, value, disabled, onChange }: OptionGroupProps<T>) {
  return (
    <View style={styles.options}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityState={{ selected, disabled }}
            disabled={disabled}
            onPress={() => onChange(option.value)}
            style={[styles.option, selected && styles.optionSelected, disabled && styles.disabled]}>
            <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  title: {
    color: BrandColors.text,
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: BrandColors.textMuted,
    fontSize: 15,
    marginTop: -Spacing.two,
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  half: {
    flex: 1,
  },
  label: {
    color: BrandColors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  option: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.fieldBorder,
    backgroundColor: BrandColors.field,
  },
  optionSelected: {
    borderColor: BrandColors.accent,
    backgroundColor: BrandColors.accent,
  },
  optionLabel: {
    color: BrandColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  optionLabelSelected: {
    color: BrandColors.text,
  },
  disabled: {
    opacity: 0.6,
  },
  error: {
    color: BrandColors.error,
    fontSize: 14,
    textAlign: 'center',
  },
});
