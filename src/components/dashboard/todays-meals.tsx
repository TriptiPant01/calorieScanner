import { StyleSheet, Text, View } from 'react-native';

import { BrandColors, Spacing } from '@/constants/theme';
import { type FoodLog } from '@/lib/meals';

type TodaysMealsProps = {
  logs: FoodLog[];
  loading: boolean;
  error: string | null;
};

export function TodaysMeals({ logs, loading, error }: TodaysMealsProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Today&apos;s meals</Text>

      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : loading ? (
        <Text style={styles.emptyText}>Loading...</Text>
      ) : logs.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No meals logged yet</Text>
          <Text style={styles.emptyText}>Meals you log will show up here.</Text>
        </View>
      ) : (
        logs.map((log) => (
          <View key={log.id} style={styles.row}>
            <View style={styles.textBlock}>
              <Text style={styles.name}>{log.food_name}</Text>
              <Text style={styles.time}>{formatTime(log.created_at)}</Text>
            </View>
            <Text style={styles.calories}>{log.calories} kcal</Text>
          </View>
        ))
      )}
    </View>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.fieldBorder,
    backgroundColor: BrandColors.field,
  },
  title: {
    color: BrandColors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  empty: {
    gap: Spacing.half,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  emptyTitle: {
    color: BrandColors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyText: {
    color: BrandColors.textMuted,
    fontSize: 13,
  },
  error: {
    color: BrandColors.error,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    borderTopWidth: 1,
    borderTopColor: BrandColors.fieldBorder,
  },
  textBlock: {
    gap: Spacing.half,
    flex: 1,
  },
  name: {
    color: BrandColors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  time: {
    color: BrandColors.textMuted,
    fontSize: 12,
  },
  calories: {
    color: BrandColors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
