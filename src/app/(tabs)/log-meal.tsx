import * as ImagePicker from 'expo-image-picker';
import { SymbolView } from 'expo-symbols';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { LoadingOverlay } from '@/components/loading-overlay';
import { BottomTabInset, BrandColors, Spacing } from '@/constants/theme';
import {
  analyzeMealPhoto,
  createFoodDraft,
  saveMeal,
  sumTotals,
  type FoodDraft,
} from '@/lib/meals';

type MacroKey = Exclude<keyof FoodDraft, 'id' | 'name'>;

const MACROS: { key: MacroKey; label: string }[] = [
  { key: 'calories', label: 'kcal' },
  { key: 'protein', label: 'Protein g' },
  { key: 'carbs', label: 'Carbs g' },
  { key: 'fat', label: 'Fat g' },
];

export default function LogMealScreen() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [items, setItems] = useState<FoodDraft[]>([]);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start every visit with a clean slate: leaving the tab discards the photo and items.
  useFocusEffect(
    useCallback(() => {
      return () => {
        setPhotoUri(null);
        setItems([]);
        setError(null);
      };
    }, []),
  );

  const totals = sumTotals(items);
  const busy = scanning || saving;

  async function scanMeal() {
    setError(null);
    setScanning(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        base64: true,
        quality: 0.5,
      });
      if (result.canceled) {
        return;
      }

      const photo = result.assets[0];
      if (!photo.base64) {
        throw new Error('Could not read the photo. Try again.');
      }

      setPhotoUri(photo.uri);
      setItems(await analyzeMealPhoto(photo.base64, photo.mimeType ?? 'image/jpeg'));
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : 'Something went wrong.');
    } finally {
      setScanning(false);
    }
  }

  function updateItem(id: string, field: keyof FoodDraft, value: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function removeItem(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  async function handleSave() {
    if (items.some((item) => !item.name.trim())) {
      setError('Give every food item a name before saving.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await saveMeal(items);
      setItems([]);
      setPhotoUri(null);
      Alert.alert('Meal saved', `${totals.calories} kcal logged.`);
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
            <Text style={styles.title}>Log your meal</Text>
            <Text style={styles.subtitle}>Snap a photo and we&apos;ll find the food items for you.</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={photoUri ? 'Retake photo' : 'Open camera to scan meal'}
              disabled={busy}
              onPress={scanMeal}
              style={({ pressed }) => [styles.photo, pressed && styles.pressed]}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <SymbolView
                    name={{ ios: 'camera', android: 'photo_camera', web: 'photo_camera' }}
                    tintColor={BrandColors.textMuted}
                    size={36}
                  />
                  <Text style={styles.placeholderText}>Tap to scan your meal</Text>
                </View>
              )}
            </Pressable>

            <AuthButton
              label={scanning ? 'Analyzing...' : photoUri ? 'Retake photo' : 'Scan meal with camera'}
              onPress={scanMeal}
              disabled={busy}
            />
            {error && <Text style={styles.error}>{error}</Text>}

            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <TextInput
                    style={[styles.input, styles.nameInput]}
                    placeholder="Food name"
                    placeholderTextColor={BrandColors.textMuted}
                    autoCapitalize="words"
                    value={item.name}
                    editable={!busy}
                    onChangeText={(value) => updateItem(item.id, 'name', value)}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remove food item"
                    hitSlop={8}
                    disabled={busy}
                    onPress={() => removeItem(item.id)}>
                    <SymbolView
                      name={{ ios: 'trash', android: 'delete', web: 'delete' }}
                      tintColor={BrandColors.error}
                      size={18}
                    />
                  </Pressable>
                </View>
                <View style={styles.macroRow}>
                  {MACROS.map(({ key, label }) => (
                    <View key={key} style={styles.macroField}>
                      <Text style={styles.macroLabel}>{label}</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        editable={!busy}
                        value={item[key]}
                        onChangeText={(value) => updateItem(item.id, key, value)}
                      />
                    </View>
                  ))}
                </View>
              </View>
            ))}

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              style={({ pressed }) => [styles.addButton, pressed && styles.pressed, busy && styles.disabled]}
              onPress={() => setItems((current) => [...current, createFoodDraft()])}>
              <SymbolView
                name={{ ios: 'plus', android: 'add', web: 'add' }}
                tintColor={BrandColors.accent}
                size={16}
              />
              <Text style={styles.addLabel}>Add food item</Text>
            </Pressable>

            {items.length > 0 && (
              <View style={styles.totals}>
                <Text style={styles.totalCalories}>{totals.calories} kcal</Text>
                <Text style={styles.totalMacros}>
                  Protein {totals.protein}g · Carbs {totals.carbs}g · Fat {totals.fat}g
                </Text>
              </View>
            )}

            <AuthButton
              label={saving ? 'Saving...' : 'Save meal'}
              onPress={handleSave}
              disabled={busy || items.length === 0}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <LoadingOverlay
        visible={busy}
        message={scanning ? 'Analyzing your meal...' : 'Saving your meal...'}
      />
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
    lineHeight: 22,
    marginTop: -Spacing.two,
  },
  photo: {
    height: 220,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.fieldBorder,
    backgroundColor: BrandColors.field,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  placeholderText: {
    color: BrandColors.textMuted,
    fontSize: 14,
  },
  error: {
    color: BrandColors.error,
    fontSize: 14,
    textAlign: 'center',
  },
  itemCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.fieldBorder,
    backgroundColor: BrandColors.field,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  macroRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  macroField: {
    flex: 1,
    gap: Spacing.half,
  },
  macroLabel: {
    color: BrandColors.textMuted,
    fontSize: 12,
  },
  input: {
    height: 44,
    paddingHorizontal: Spacing.two,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.fieldBorder,
    backgroundColor: BrandColors.background,
    color: BrandColors.text,
    fontSize: 15,
  },
  nameInput: {
    flex: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    height: 48,
  },
  addLabel: {
    color: BrandColors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.6,
  },
  totals: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  totalCalories: {
    color: BrandColors.text,
    fontSize: 32,
    fontWeight: '700',
  },
  totalMacros: {
    color: BrandColors.textMuted,
    fontSize: 13,
  },
});
