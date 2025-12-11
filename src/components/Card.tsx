import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../utils/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'elevated',
  padding = 'medium',
}) => {
  const getCardStyle = () => {
    const baseStyle: any[] = [styles.card];

    // Variant styles
    switch (variant) {
      case 'elevated':
        baseStyle.push(styles.elevated, shadows.sm);
        break;
      case 'outlined':
        baseStyle.push(styles.outlined);
        break;
      case 'flat':
        baseStyle.push(styles.flat);
        break;
    }

    // Padding styles
    switch (padding) {
      case 'none':
        baseStyle.push(styles.paddingNone);
        break;
      case 'small':
        baseStyle.push(styles.paddingSmall);
        break;
      case 'medium':
        baseStyle.push(styles.paddingMedium);
        break;
      case 'large':
        baseStyle.push(styles.paddingLarge);
        break;
    }

    return baseStyle;
  };

  return (
    <View style={[...getCardStyle(), style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  elevated: {
    borderWidth: 0,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  flat: {
    backgroundColor: colors.backgroundLight,
    borderWidth: 0,
  },
  paddingNone: {
    padding: 0,
  },
  paddingSmall: {
    padding: spacing.md,
  },
  paddingMedium: {
    padding: spacing.lg,
  },
  paddingLarge: {
    padding: spacing.xl,
  },
});
