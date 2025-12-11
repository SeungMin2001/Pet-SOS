export const colors = {
  // Primary colors - Soft, professional pet care theme
  primary: '#5B8CFF', // Soft blue - trust, calm
  primaryLight: '#7FA3FF',
  primaryDark: '#4370E6',

  secondary: '#6BCFB8', // Soft mint - medical, fresh
  secondaryLight: '#8EDBC9',
  secondaryDark: '#52B89F',

  accent: '#FFB84D', // Warm orange - friendly, attention
  accentLight: '#FFC870',
  accentDark: '#E6A43A',

  emergency: '#FF6B6B', // Emergency red - for urgent actions only
  emergencyLight: '#FF8787',

  // Background colors - Clean, soft
  background: '#FFFFFF',
  backgroundLight: '#F8FAFB',
  backgroundDark: '#EFF3F6',

  // Text colors
  textPrimary: '#2D3748',
  textSecondary: '#718096',
  textLight: '#A0AEC0',
  textWhite: '#FFFFFF',

  // Status colors
  success: '#48BB78',
  successLight: '#68D391',
  warning: '#ECC94B',
  warningLight: '#F6E05E',
  error: '#F56565',
  errorLight: '#FC8181',
  info: '#4299E1',
  infoLight: '#63B3ED',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F7FAFC',
  gray100: '#EDF2F7',
  gray200: '#E2E8F0',
  gray300: '#CBD5E0',
  gray400: '#A0AEC0',
  gray500: '#718096',
  gray600: '#4A5568',
  gray700: '#2D3748',
  gray800: '#1A202C',
  gray900: '#171923',

  // Specific use colors
  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  shadow: 'rgba(0, 0, 0, 0.06)',
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Card colors
  cardBackground: '#FFFFFF',
  cardBorder: '#E2E8F0',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '400' as const,
    lineHeight: 28,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

export const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
