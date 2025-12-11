import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { petsAPI, requestsAPI, hospitalsAPI } from '../../services/api';
import { Pet, EmergencyRequest, Hospital } from '../../types';
import { Linking } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';

export const GuardianHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [activeRequests, setActiveRequests] = useState<EmergencyRequest[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    try {
      const [petsData, requestsData, hospitalsData] = await Promise.all([
        petsAPI.getMyPets(),
        requestsAPI.getMyRequests(),
        hospitalsAPI.getNearbyHospitals(37.5, 127.0, 10),
      ]);
      setPets(petsData);
      setHospitals(hospitalsData);
      // Filter only active requests
      const active = requestsData.filter(
        (r) => !['completed', 'cancelled'].includes(r.status)
      );
      setActiveRequests(active);
    } catch (error) {
      console.error('Failed to load data:', error);
      Alert.alert('오류', '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const deletePet = (petId: number, petName: string) => {
    Alert.alert(
      '삭제 확인',
      `${petName}을(를) 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            setPets(pets.filter(p => p.id !== petId));
            Alert.alert('완료', '삭제되었습니다');
          },
        },
      ]
    );
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: '라이더 매칭 중',
      rider_assigned: '라이더 배정됨',
      picking_up: '픽업 중',
      on_way_to_hospital: '병원 이동 중',
      completed: '완료',
      cancelled: '취소됨',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending: colors.warning,
      rider_assigned: colors.info,
      picking_up: colors.secondary,
      on_way_to_hospital: colors.primary,
      completed: colors.success,
      cancelled: colors.gray500,
    };
    return colorMap[status] || colors.gray500;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>안녕하세요</Text>
          <Text style={styles.userName}>{user?.name}님</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Emergency Button */}
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={() => {
            if (pets.length === 0) {
              Alert.alert('알림', '먼저 반려동물을 등록해주세요');
            } else {
              navigation.navigate('EmergencyCall');
            }
          }}
        >
          <Text style={styles.emergencyIcon}>🚨</Text>
          <Text style={styles.emergencyTitle}>긴급 호출</Text>
          <Text style={styles.emergencySubtitle}>
            반려동물이 아프거나 다쳤나요?
          </Text>
        </TouchableOpacity>

        {/* Active Requests */}
        {activeRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>진행 중인 요청</Text>
            {activeRequests.map((request) => (
              <Card key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(request.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(request.status) },
                      ]}
                    >
                      {getStatusText(request.status)}
                    </Text>
                  </View>
                  <Text style={styles.requestTime}>
                    {new Date(request.created_at).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text style={styles.requestPet}>반려동물: {request.pet?.name}</Text>
                <Text style={styles.requestSymptoms}>{request.symptoms}</Text>
                <Button
                  title="상세 보기"
                  onPress={() => {
                    navigation.navigate('RequestTracking', { requestId: request.id });
                  }}
                  variant="outline"
                  size="small"
                  style={styles.detailButton}
                />
              </Card>
            ))}
          </View>
        )}

        {/* My Pets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>내 반려동물</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AddPet')}>
              <Text style={styles.addButton}>+ 추가</Text>
            </TouchableOpacity>
          </View>

          {pets.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyText}>등록된 반려동물이 없습니다</Text>
              <Text style={styles.emptySubtext}>
                위의 + 추가 버튼을 눌러{'\n'}
                첫 반려동물을 등록해보세요
              </Text>
            </Card>
          ) : (
            pets.map((pet) => (
              <Card key={pet.id} style={styles.petCard}>
                <View style={styles.petInfo}>
                  <View style={styles.petIcon}>
                    <Text style={styles.petIconText}>
                      {pet.species === '강아지' ? '🐕' : '🐈'}
                    </Text>
                  </View>
                  <View style={styles.petDetails}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petBreed}>
                      {pet.breed || pet.species} • {pet.age || 0}살
                    </Text>
                    {pet.medical_notes && (
                      <Text style={styles.petNotes}>{pet.medical_notes}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deletePet(pet.id, pet.name)}
                  >
                    <Text style={styles.deleteButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Nearby Hospitals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>근처 동물병원</Text>
          {hospitals.slice(0, 3).map((hospital) => (
            <Card key={hospital.id} style={styles.hospitalCard}>
              <View style={styles.hospitalHeader}>
                <View style={styles.hospitalInfo}>
                  <Text style={styles.hospitalName}>{hospital.name}</Text>
                  {hospital.is_24hour && (
                    <View style={styles.badge24}>
                      <Text style={styles.badge24Text}>24시</Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.hospitalAddress}>{hospital.address}</Text>
              <Text style={styles.hospitalSpecialties}>{hospital.specialties}</Text>
              <View style={styles.hospitalActions}>
                <TouchableOpacity
                  style={styles.hospitalButton}
                  onPress={() => {
                    Alert.alert(
                      '전화 연결',
                      `${hospital.name}\n${hospital.phone}\n\n전화를 거시겠습니까?`,
                      [
                        { text: '취소', style: 'cancel' },
                        {
                          text: '전화 걸기',
                          onPress: () => Linking.openURL(`tel:${hospital.phone}`),
                        },
                      ]
                    );
                  }}
                >
                  <Text style={styles.hospitalButtonText}>📞 전화</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.hospitalButton, styles.hospitalButtonPrimary]}
                  onPress={() => {
                    navigation.navigate('HospitalMap', {
                      hospital: hospital,
                      userLocation: {
                        latitude: 37.4979,
                        longitude: 127.0276,
                      },
                    });
                  }}
                >
                  <Text style={[styles.hospitalButtonText, styles.hospitalButtonTextPrimary]}>🗺 길찾기</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))}
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>응급처치 가이드</Text>
          <Card style={styles.guideCard}>
            <TouchableOpacity style={styles.guideItem} onPress={() => Alert.alert('출혈 시 응급처치', '1. 깨끗한 거즈로 상처 부위를 압박합니다.\n2. 출혈이 심한 경우 즉시 병원으로 이동합니다.\n3. 압박 후에도 출혈이 멈추지 않으면 119에 연락합니다.')}>
              <Text style={styles.guideIcon}>🩹</Text>
              <Text style={styles.guideText}>출혈 시 응급처치</Text>
            </TouchableOpacity>
            <View style={styles.guideDivider} />
            <TouchableOpacity style={styles.guideItem} onPress={() => Alert.alert('호흡곤란 대처법', '1. 반려동물을 조용하고 시원한 곳에 눕힙니다.\n2. 목줄이나 목을 조이는 것을 풀어줍니다.\n3. 즉시 동물병원에 연락합니다.')}>
              <Text style={styles.guideIcon}>🫁</Text>
              <Text style={styles.guideText}>호흡곤란 대처법</Text>
            </TouchableOpacity>
            <View style={styles.guideDivider} />
            <TouchableOpacity style={styles.guideItem} onPress={() => Alert.alert('골절 시 대처법', '1. 부상 부위를 움직이지 않도록 고정합니다.\n2. 반려동물을 조심스럽게 옮깁니다.\n3. 즉시 동물병원으로 이동합니다.')}>
              <Text style={styles.guideIcon}>🦴</Text>
              <Text style={styles.guideText}>골절 시 대처법</Text>
            </TouchableOpacity>
          </Card>
        </View>
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
    padding: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...typography.body,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  logoutButton: {
    padding: spacing.sm,
  },
  logoutText: {
    ...typography.bodySmall,
    color: colors.primary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  emergencyButton: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emergencyIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emergencyTitle: {
    ...typography.h3,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  emergencySubtitle: {
    ...typography.body,
    color: colors.white,
    opacity: 0.9,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  addButton: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  requestCard: {
    marginBottom: spacing.md,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  requestTime: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  requestPet: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  requestSymptoms: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  detailButton: {
    marginTop: spacing.sm,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.h4,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  petCard: {
    marginBottom: spacing.md,
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  petIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  petIconText: {
    fontSize: 32,
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  petBreed: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  petNotes: {
    ...typography.bodySmall,
    color: colors.warning,
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  deleteButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  guideCard: {
    padding: 0,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  guideIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  guideText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  guideDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  hospitalCard: {
    marginBottom: spacing.md,
  },
  hospitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  hospitalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  hospitalName: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  badge24: {
    backgroundColor: colors.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
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
    marginBottom: spacing.md,
  },
  hospitalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  hospitalButton: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  hospitalButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  hospitalButtonText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  hospitalButtonTextPrimary: {
    color: colors.white,
  },
});
