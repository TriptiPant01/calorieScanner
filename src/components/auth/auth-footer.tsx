import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandColors, Spacing } from '@/constants/theme';

type AuthFooterProps = {
  prompt: string;
  actionLabel: string;
  href: '/login' | '/signup';
};

export function AuthFooter({ prompt, actionLabel, href }: AuthFooterProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.prompt}>{prompt}</Text>
      <Link href={href} asChild>
        <Pressable accessibilityRole="link">
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  prompt: {
    color: BrandColors.textMuted,
    fontSize: 14,
  },
  action: {
    color: BrandColors.accent,
    fontSize: 14,
    fontWeight: '700',
  },
});
