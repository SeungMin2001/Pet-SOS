import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { petsAPI, hospitalsAPI, requestsAPI } from '../../services/api';
import { Pet, Hospital } from '../../types';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';

export const EmergencyCallScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [petsData, hospitalsData] = await Promise.all([
        petsAPI.getMyPets(),
        hospitalsAPI.getNearbyHospitals(37.5, 127.0, 10),
      ]);
      setPets(petsData);
      setHospitals(hospitalsData.sort((a, b) => {
        // 24시간 병원 우선
        if (a.is_24hour && !b.is_24hour) return -1;
        if (!a.is_24hour && b.is_24hour) return 1;
        return 0;
      }));

      // 첫 번째 펫과 병원 자동 선택
      if (petsData.length > 0) setSelectedPet(petsData[0]);
      if (hospitalsData.length > 0) setSelectedHospital(hospitalsData[0]);
    } catch (error) {
      Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyCall = async () => {
    if (!selectedPet) {
      Alert.alert('알림', '반려동물을 선택해주세요');
      return;
    }

    if (!selectedHospital) {
      Alert.alert('알림', '병원을 선택해주세요');
      return;
    }

    if (!symptoms.trim()) {
      Alert.alert('알림', '증상을 입력해주세요');
      return;
    }

    setSubmitting(true);
    try {
      const request = await requestsAPI.createRequest({
        pet_id: selectedPet.id,
        hospital_id: selectedHospital.id,
        symptoms: symptoms.trim(),
        pickup_latitude: 37.4979,
        pickup_longitude: 127.0276,
      });

      Alert.alert(
        '긴급 호출 완료!',
        `${selectedPet.name}의 응급 이송 요청이 접수되었습니다.\n\n` +
        `병원: ${selectedHospital.name}\n` +
        `증상: ${symptoms}\n\n` +
        `가까운 라이더를 찾고 있습니다...`,
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('RequestTracking', { requestId: request.id }),
          },
        ]
      );
    } catch (error) {
      Alert.alert('오류', '긴급 호출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>병원 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 돌아가기</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🚨 긴급 호출</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.content}>
        <Card style={styles.warningCard}>
          <Text style={styles.warningText}>
            ⚠️ 생명이 위급한 경우 먼저 119에 연락하세요
          </Text>
        </Card>

        {/* 반려동물 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>반려동물 선택</Text>
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={[
                styles.petCard,
                selectedPet?.id === pet.id && styles.petCardActive,
              ]}
              onPress={() => setSelectedPet(pet)}
            >
              <Text style={styles.petEmoji}>
                {pet.species === '강아지' ? '🐕' : '🐈'}
              </Text>
              <View style={styles.petInfo}>
                <Text style={styles.petName}>{pet.name}</Text>
                <Text style={styles.petBreed}>
                  {pet.breed || pet.species} • {pet.age || 0}살
                </Text>
                {pet.medical_notes && (
                  <Text style={styles.petNotes}>⚠️ {pet.medical_notes}</Text>
                )}
              </View>
              {selectedPet?.id === pet.id && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 증상 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>증상 설명</Text>
          <Input
            placeholder="어떤 증상이 있나요? (예: 구토, 출혈, 호흡곤란 등)"
            value={symptoms}
            onChangeText={setSymptoms}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* 병원 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이송 병원 (가까운 순)</Text>
          {hospitals.slice(0, 3).map((hospital) => (
            <TouchableOpacity
              key={hospital.id}
              style={[
                styles.hospitalCard,
                selectedHospital?.id === hospital.id && styles.hospitalCardActive,
              ]}
              onPress={() => setSelectedHospital(hospital)}
            >
              <View style={styles.hospitalHeader}>
                <View style={styles.hospitalTitleRow}>
                  <Text style={styles.hospitalName}>{hospital.name}</Text>
                  {hospital.is_24hour && (
                    <View style={styles.badge24}>
                      <Text style={styles.badge24Text}>24시</Text>
                    </View>
                  )}
                </View>
                {selectedHospital?.id === hospital.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.hospitalAddress}>{hospital.address}</Text>
              <Text style={styles.hospitalSpecialties}>
                📍 {hospital.specialties}
              </Text>
              <Text style={styles.hospitalPhone}>📞 {hospital.phone}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="라이더 호출하기"
          onPress={handleEmergencyCall}
          loading={submitting}
          style={styles.submitButton}
        />

        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 긴급 호출 안내</Text>
          <Text style={styles.infoText}>
            • 라이더가 현재 위치로 출동합니다{'\n'}
            • 선택한 병원으로 안전하게 이송됩니다{'\n'}
            • 반려동물 정보가 병원에 전달됩니다{'\n'}
            • 실시간으로 이송 상황을 확인할 수 있습니다
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
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
  warningCard: {
    backgroundColor: colors.warning + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    marginBottom: spacing.lg,
  },
  warningText: {
    ...typography.body,
    color: colors.warning,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  petCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  petEmoji: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  petBreed: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  petNotes: {
    ...typography.bodySmall,
    color: colors.warning,
    marginTop: spacing.xs,
  },
  checkmark: {
    fontSize: 24,
    color: colors.primary,
  },
  hospitalCard: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  hospitalCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  hospitalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  hospitalName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  badge24: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badge24Text: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '600',
  },
  hospitalAddress: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  hospitalSpecialties: {
    ...typography.bodySmall,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  hospitalPhone: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  submitButton: {
    marginBottom: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.info + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    marginBottom: spacing.xl,
  },
  infoTitle: {
    ...typography.h4,
    color: colors.info,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
