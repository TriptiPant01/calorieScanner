import { type ComponentProps, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { BrandColors, Spacing } from '@/constants/theme';

type AuthFieldProps = TextInputProps & {
  label: string;
  icon: ComponentProps<typeof SymbolView>['name'];
  trailing?: ReactNode;
};

export function AuthField({ label, icon, trailing, ...inputProps }: AuthFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        <SymbolView name={icon} tintColor={BrandColors.textMuted} size={18} />
        <TextInput
          placeholderTextColor={BrandColors.textMuted}
          autoCapitalize="none"
          style={styles.input}
          {...inputProps}
        />
        {trailing}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.two,
  },
  label: {
    color: BrandColors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    height: 56,
    paddingHorizontal: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BrandColors.fieldBorder,
    backgroundColor: BrandColors.field,
  },
  input: {
    flex: 1,
    height: '100%',
    color: BrandColors.text,
    fontSize: 16,
  },
});
