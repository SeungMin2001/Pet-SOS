import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../utils/theme';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'text' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.gray200;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'accent':
        return colors.accent;
      case 'outline':
        return 'transparent';
      case 'ghost':
        return colors.gray100;
      case 'text':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.gray400;
    switch (variant) {
      case 'primary':
        return colors.white;
      case 'secondary':
        return colors.white;
      case 'accent':
        return colors.textPrimary;
      case 'outline':
        return colors.primary;
      case 'ghost':
        return colors.textPrimary;
      case 'text':
        return colors.primary;
      default:
        return colors.white;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md };
      case 'medium':
        return { paddingVertical: spacing.md + 2, paddingHorizontal: spacing.lg };
      case 'large':
        return { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl };
      default:
        return { paddingVertical: spacing.md + 2, paddingHorizontal: spacing.lg };
    }
  };

  const getBorderStyle = () => {
    if (variant === 'outline') {
      return {
        borderWidth: 1.5,
        borderColor: disabled ? colors.gray300 : colors.primary,
      };
    }
    return {};
  };

  const getShadow = () => {
    if (variant === 'text' || variant === 'ghost' || disabled) return {};
    return shadows.sm;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          ...getPadding(),
          ...getBorderStyle(),
          ...getShadow(),
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    ...typography.button,
    textAlign: 'center',
    fontWeight: '600',
  },
});
