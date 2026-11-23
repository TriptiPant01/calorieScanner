import { Pressable, StyleSheet, Text } from 'react-native';

import { BrandColors } from '@/constants/theme';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function AuthButton({ label, onPress, disabled }: AuthButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 16,
    backgroundColor: BrandColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: BrandColors.accentPressed,
  },
  disabled: {
    opacity: 0.6,
  },
  label: {
    color: BrandColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
});
