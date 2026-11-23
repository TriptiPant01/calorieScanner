import { StyleSheet, Text, View } from 'react-native';

import { BrandColors, Spacing } from '@/constants/theme';
import { localDayKey, sumFoodLogs, type FoodLog } from '@/lib/meals';

type HistoryCardProps = {
  logs: FoodLog[];
  todayKey: string;
};

/** Previous days in the loaded range, newest first, each with its calorie total. */
export function HistoryCard({ logs, todayKey }: HistoryCardProps) {
  const byDay = new Map<string, FoodLog[]>();
  for (const log of logs) {
    const key = localDayKey(log.created_at);
    if (key === todayKey) {
      continue;
    }
    byDay.set(key, [...(byDay.get(key) ?? []), log]);
  }

  // YYYY-MM-DD keys sort correctly as plain strings.
  const days = [...byDay.keys()].sort().reverse();

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Previous days</Text>

      {days.length === 0 ? (
        <Text style={styles.emptyText}>Your earlier days will show up here.</Text>
      ) : (
        days.map((key) => {
          const dayLogs = byDay.get(key) ?? [];
          const totals = sumFoodLogs(dayLogs);
          return (
            <View key={key} style={styles.row}>
              <View style={styles.textBlock}>
                <Text style={styles.day}>{formatDay(key)}</Text>
                <Text style={styles.foods} numberOfLines={2}>
                  {dayLogs.map((log) => log.food_name).join(', ')}
                </Text>
              </View>
              <Text style={styles.calories}>{totals.calories} kcal</Text>
            </View>
          );
        })
      )}
    </View>
  );
}

function formatDay(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
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
  emptyText: {
    color: BrandColors.textMuted,
    fontSize: 13,
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
    marginRight: Spacing.two,
  },
  day: {
    color: BrandColors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  foods: {
    color: BrandColors.textMuted,
    fontSize: 12,
  },
  calories: {
    color: BrandColors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
