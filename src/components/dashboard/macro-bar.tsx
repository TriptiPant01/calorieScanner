import { StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/dashboard/progress-bar';
import { BrandColors, Spacing } from '@/constants/theme';

type MacroBarProps = {
  label: string;
  consumed: number;
  goal: number;
};

export function MacroBar({ label, consumed, goal }: MacroBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>
          {consumed}g / {goal}g
        </Text>
      </View>
      <ProgressBar progress={consumed / goal} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.two,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: BrandColors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: BrandColors.textMuted,
    fontSize: 12,
  },
});
