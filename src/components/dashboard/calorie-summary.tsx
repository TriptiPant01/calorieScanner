import { StyleSheet, Text, View } from 'react-native';

import { BrandColors, Spacing } from '@/constants/theme';
import { ProgressBar } from '@/components/dashboard/progress-bar';

type CalorieSummaryProps = {
  consumed: number;
  goal: number;
};

export function CalorieSummary({ consumed, goal }: CalorieSummaryProps) {
  const remaining = Math.max(goal - consumed, 0);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Calories today</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{consumed.toLocaleString()}</Text>
        <Text style={styles.goal}>/ {goal.toLocaleString()} kcal</Text>
      </View>
      <ProgressBar progress={consumed / goal} />
      <Text style={styles.remaining}>{remaining.toLocaleString()} kcal remaining</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.fieldBorder,
    backgroundColor: BrandColors.field,
  },
  label: {
    color: BrandColors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.one,
  },
  value: {
    color: BrandColors.text,
    fontSize: 40,
    fontWeight: '700',
  },
  goal: {
    color: BrandColors.textMuted,
    fontSize: 16,
  },
  remaining: {
    color: BrandColors.textMuted,
    fontSize: 13,
  },
});
