import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';

type UserTypeSelection = 'guardian' | 'rider' | null;

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register } = useAuth();
  const [userType, setUserType] = useState<UserTypeSelection>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};

    if (!userType) {
      Alert.alert('알림', '사용자 유형을 선택해주세요');
      return false;
    }

    if (!formData.email) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }

    if (!formData.password) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else if (formData.password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    if (!formData.name) {
      newErrors.name = '이름을 입력해주세요';
    }

    if (!formData.phone) {
      newErrors.phone = '전화번호를 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        user_type: userType!,
      });
    } catch (error: any) {
      Alert.alert(
        '회원가입 실패',
        error.response?.data?.detail || '회원가입 중 오류가 발생했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>사용자 유형을 선택해주세요</Text>
        </View>

        <View style={styles.userTypeContainer}>
          <TouchableOpacity
            style={[
              styles.userTypeCard,
              userType === 'guardian' && styles.userTypeCardSelected,
            ]}
            onPress={() => setUserType('guardian')}
          >
            <Text style={styles.userTypeIcon}>🐾</Text>
            <Text style={styles.userTypeTitle}>보호자</Text>
            <Text style={styles.userTypeDescription}>
              반려동물 응급 이송을 요청합니다
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.userTypeCard,
              userType === 'rider' && styles.userTypeCardSelected,
            ]}
            onPress={() => setUserType('rider')}
          >
            <Text style={styles.userTypeIcon}>🚗</Text>
            <Text style={styles.userTypeTitle}>라이더</Text>
            <Text style={styles.userTypeDescription}>
              반려동물을 안전하게 이송합니다
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Input
            label="이메일"
            placeholder="이메일을 입력하세요"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <Input
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
            error={errors.password}
          />

          <Input
            label="비밀번호 확인"
            placeholder="비밀번호를 다시 입력하세요"
            value={formData.confirmPassword}
            onChangeText={(text) =>
              setFormData({ ...formData, confirmPassword: text })
            }
            secureTextEntry
            error={errors.confirmPassword}
          />

          <Input
            label="이름"
            placeholder="이름을 입력하세요"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            error={errors.name}
          />

          <Input
            label="전화번호"
            placeholder="전화번호를 입력하세요 (예: 010-1234-5678)"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
            error={errors.phone}
          />

          <Button
            title="회원가입"
            onPress={handleRegister}
            loading={loading}
            style={styles.registerButton}
          />

          <Button
            title="로그인으로 돌아가기"
            onPress={() => navigation.goBack()}
            variant="text"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.xl,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  userTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  userTypeCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  userTypeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  userTypeIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  userTypeTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userTypeDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  registerButton: {
    marginBottom: spacing.md,
  },
});
