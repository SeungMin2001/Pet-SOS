import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { petsAPI } from '../../services/api';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';

export const AddPetScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<'강아지' | '고양이' | ''>('');
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('알림', '반려동물의 이름을 입력해주세요');
      return;
    }

    if (!species) {
      Alert.alert('알림', '종류를 선택해주세요');
      return;
    }

    setLoading(true);
    try {
      await petsAPI.createPet({
        name: name.trim(),
        species,
        breed: breed.trim() || undefined,
        age: age ? parseInt(age) : undefined,
        medical_notes: medicalNotes.trim() || undefined,
      });

      Alert.alert('성공', `${name}이(가) 등록되었습니다!`, [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('오류', '반려동물 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 돌아가기</Text>
        </TouchableOpacity>
        <Text style={styles.title}>반려동물 등록</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.formCard}>
          <Input
            label="이름 *"
            placeholder="반려동물의 이름"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>종류 *</Text>
            <View style={styles.speciesButtons}>
              <TouchableOpacity
                style={[
                  styles.speciesButton,
                  species === '강아지' && styles.speciesButtonActive,
                ]}
                onPress={() => setSpecies('강아지')}
              >
                <Text
                  style={[
                    styles.speciesButtonText,
                    species === '강아지' && styles.speciesButtonTextActive,
                  ]}
                >
                  🐕 강아지
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.speciesButton,
                  species === '고양이' && styles.speciesButtonActive,
                ]}
                onPress={() => setSpecies('고양이')}
              >
                <Text
                  style={[
                    styles.speciesButtonText,
                    species === '고양이' && styles.speciesButtonTextActive,
                  ]}
                >
                  🐈 고양이
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <Input
            label="품종"
            placeholder="예: 골든 리트리버, 코리안 숏헤어"
            value={breed}
            onChangeText={setBreed}
          />

          <Input
            label="나이"
            placeholder="숫자만 입력 (예: 3)"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />

          <Input
            label="건강 특이사항"
            placeholder="알레르기, 병력 등"
            value={medicalNotes}
            onChangeText={setMedicalNotes}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.hint}>* 필수 항목</Text>
        </Card>

        <Button
          title="등록하기"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  header: {
    backgroundColor: colors.white,
    paddingTop: spacing.xxl + spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    ...typography.body,
    color: colors.primary,
    width: 80,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  speciesButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  speciesButton: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  speciesButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  speciesButtonText: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  speciesButtonTextActive: {
    color: colors.primary,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  submitButton: {
    marginBottom: spacing.xl,
  },
});
