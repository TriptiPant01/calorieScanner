import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { BrandColors, Spacing } from '@/constants/theme';

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
};

/** Covers its parent while work is running, so taps on the content underneath do nothing. */
export function LoadingOverlay({ visible, message = 'Loading...' }: LoadingOverlayProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.overlay} accessibilityLabel={message} accessibilityLiveRegion="polite">
      <View style={styles.card}>
        <ActivityIndicator size="large" color={BrandColors.accent} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 10,
  },
  card: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BrandColors.fieldBorder,
    backgroundColor: BrandColors.field,
  },
  message: {
    color: BrandColors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
