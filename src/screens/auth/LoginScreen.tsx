import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, shadows, borderRadius } from '../../utils/theme';

export const LoginScreen: React.FC = () => {
  const { loginAsUserType } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSelectUserType = async (userType: 'guardian' | 'rider') => {
    setLoading(true);
    try {
      await loginAsUserType(userType);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🐾</Text>
          </View>
          <Text style={styles.appName}>PetSOS</Text>
          <Text style={styles.tagline}>반려동물 응급 이송 서비스</Text>
        </View>

        {/* Selection Section */}
        <View style={styles.selectionSection}>
          <Text style={styles.selectionTitle}>시작하기</Text>
          <Text style={styles.selectionSubtitle}>사용자 유형을 선택해주세요</Text>

          <View style={styles.cardsContainer}>
            {/* Guardian Card */}
            <TouchableOpacity
              style={styles.userTypeCard}
              onPress={() => handleSelectUserType('guardian')}
              disabled={loading}
              activeOpacity={0.85}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardIconContainer}>
                  <Text style={styles.cardEmoji}>🐾</Text>
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>보호자</Text>
                  <Text style={styles.cardDescription}>
                    반려동물 응급 이송 요청
                  </Text>
                </View>
                <Text style={styles.cardArrow}>→</Text>
              </View>
            </TouchableOpacity>

            {/* Rider Card */}
            <TouchableOpacity
              style={[styles.userTypeCard, styles.riderCard]}
              onPress={() => handleSelectUserType('rider')}
              disabled={loading}
              activeOpacity={0.85}
            >
              <View style={styles.cardContent}>
                <View style={[styles.cardIconContainer, styles.riderIconContainer]}>
                  <Text style={styles.cardEmoji}>🚗</Text>
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle}>라이더</Text>
                  <Text style={styles.cardDescription}>
                    안전한 반려동물 이송
                  </Text>
                </View>
                <Text style={styles.cardArrow}>→</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🚨 24시간 긴급 이송 서비스
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
    paddingBottom: spacing.xxl,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  logoEmoji: {
    fontSize: 50,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  selectionSection: {
    flex: 1,
  },
  selectionTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    fontWeight: '700',
  },
  selectionSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  cardsContainer: {
    gap: spacing.lg,
  },
  userTypeCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  riderCard: {
    borderColor: colors.secondary,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderIconContainer: {
    backgroundColor: colors.secondary + '15',
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  cardDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  cardArrow: {
    fontSize: 24,
    color: colors.textLight,
    fontWeight: '300',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});
