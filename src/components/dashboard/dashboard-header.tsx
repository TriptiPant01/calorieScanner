import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandColors, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

type DashboardHeaderProps = {
  name: string;
};

export function DashboardHeader({ name }: DashboardHeaderProps) {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={styles.greeting}>Hi, {name}</Text>
        <Text style={styles.date}>{today}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Log out"
        onPress={() => supabase.auth.signOut()}
        style={({ pressed }) => [styles.logout, pressed && styles.pressed]}>
        <SymbolView
          name={{
            ios: 'rectangle.portrait.and.arrow.right',
            android: 'logout',
            web: 'logout',
          }}
          tintColor={BrandColors.text}
          size={18}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textBlock: {
    gap: Spacing.half,
  },
  greeting: {
    color: BrandColors.text,
    fontSize: 26,
    fontWeight: '700',
  },
  date: {
    color: BrandColors.textMuted,
    fontSize: 14,
  },
  logout: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: BrandColors.fieldBorder,
    backgroundColor: BrandColors.field,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
