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
import MapView, { Marker } from 'react-native-maps';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { requestsAPI } from '../../services/api';
import { EmergencyRequest } from '../../types';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import { getRiderLocationForRequest } from '../../data/mockData';

const STATUS_INFO = {
  pending: {
    icon: '⏳',
    title: '요청 대기 중',
    description: '가까운 라이더를 찾고 있습니다',
    color: colors.warning,
  },
  rider_assigned: {
    icon: '🚗',
    title: '라이더 배정 완료',
    description: '라이더가 출동 중입니다',
    color: colors.info,
  },
  picking_up: {
    icon: '📍',
    title: '픽업 진행 중',
    description: '라이더가 도착했습니다',
    color: colors.primary,
  },
  on_way_to_hospital: {
    icon: '🏥',
    title: '병원 이동 중',
    description: '병원으로 이동하고 있습니다',
    color: colors.primary,
  },
  completed: {
    icon: '✅',
    title: '이송 완료',
    description: '병원에 안전하게 도착했습니다',
    color: colors.success,
  },
  cancelled: {
    icon: '❌',
    title: '취소됨',
    description: '요청이 취소되었습니다',
    color: colors.error,
  },
};

export const RequestTrackingScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { requestId } = route.params;
  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequest();
    // 실제 앱에서는 WebSocket이나 polling으로 실시간 업데이트
    const interval = setInterval(loadRequest, 5000);
    return () => clearInterval(interval);
  }, [requestId]);

  const loadRequest = async () => {
    try {
      const data = await requestsAPI.getRequest(requestId);
      setRequest(data);
    } catch (error) {
      Alert.alert('오류', '요청 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      '요청 취소',
      '정말 긴급 이송 요청을 취소하시겠습니까?',
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '예',
          style: 'destructive',
          onPress: async () => {
            try {
              await requestsAPI.cancelRequest(requestId);
              Alert.alert('취소 완료', '요청이 취소되었습니다.', [
                { text: '확인', onPress: () => navigation.goBack() },
              ]);
            } catch (error) {
              Alert.alert('오류', '요청 취소에 실패했습니다.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>요청 정보를 불러오는 중...</Text>
      </View>
    );
  }

  if (!request) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>요청을 찾을 수 없습니다</Text>
        <Button title="돌아가기" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const statusInfo = STATUS_INFO[request.status as keyof typeof STATUS_INFO];
  const canCancel = request.status === 'pending' || request.status === 'rider_assigned';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 돌아가기</Text>
        </TouchableOpacity>
        <Text style={styles.title}>이송 현황</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* 현재 상태 */}
        <Card style={[styles.statusCard, { borderLeftColor: statusInfo.color }]}>
          <Text style={styles.statusIcon}>{statusInfo.icon}</Text>
          <Text style={[styles.statusTitle, { color: statusInfo.color }]}>
            {statusInfo.title}
          </Text>
          <Text style={styles.statusDescription}>{statusInfo.description}</Text>
        </Card>

        {/* 진행 단계 */}
        <Card style={styles.progressCard}>
          <Text style={styles.sectionTitle}>진행 단계</Text>
          <View style={styles.progressSteps}>
            {Object.entries(STATUS_INFO)
              .filter(([status]) => status !== 'cancelled')
              .map(([status, info], index) => {
                const isActive = request.status === status;
                const isCompleted =
                  ['rider_assigned', 'picking_up', 'on_way_to_hospital', 'completed'].indexOf(
                    request.status
                  ) >=
                  ['rider_assigned', 'picking_up', 'on_way_to_hospital', 'completed'].indexOf(
                    status
                  );

                return (
                  <View key={status} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepDot,
                        isCompleted && styles.stepDotCompleted,
                        isActive && styles.stepDotActive,
                      ]}
                    >
                      <Text style={styles.stepIcon}>{info.icon}</Text>
                    </View>
                    <View style={styles.stepInfo}>
                      <Text
                        style={[
                          styles.stepTitle,
                          isActive && styles.stepTitleActive,
                        ]}
                      >
                        {info.title}
                      </Text>
                    </View>
                    {index <
                      Object.entries(STATUS_INFO).filter(
                        ([s]) => s !== 'cancelled'
                      ).length -
                        1 && (
                      <View
                        style={[
                          styles.stepLine,
                          isCompleted && styles.stepLineCompleted,
                        ]}
                      />
                    )}
                  </View>
                );
              })}
          </View>
        </Card>

        {/* 반려동물 정보 */}
        {request.pet && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>🐾 반려동물 정보</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>이름:</Text>
              <Text style={styles.infoValue}>{request.pet.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>종류:</Text>
              <Text style={styles.infoValue}>
                {request.pet.species} {request.pet.breed && `(${request.pet.breed})`}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>증상:</Text>
              <Text style={styles.infoValue}>{request.symptoms}</Text>
            </View>
            {request.pet.medical_notes && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>특이사항:</Text>
                <Text style={[styles.infoValue, { color: colors.warning }]}>
                  ⚠️ {request.pet.medical_notes}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* 병원 정보 */}
        {request.hospital && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>🏥 이송 병원</Text>
            <View style={styles.hospitalHeader}>
              <Text style={styles.hospitalName}>{request.hospital.name}</Text>
              {request.hospital.is_24hour && (
                <View style={styles.badge24}>
                  <Text style={styles.badge24Text}>24시</Text>
                </View>
              )}
            </View>
            <Text style={styles.hospitalAddress}>{request.hospital.address}</Text>
            <Text style={styles.hospitalPhone}>📞 {request.hospital.phone}</Text>
          </Card>
        )}

        {/* 라이더 정보 */}
        {request.rider_id && (
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>🚗 담당 라이더</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>라이더:</Text>
              <Text style={styles.infoValue}>이라이더</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>연락처:</Text>
              <Text style={styles.infoValue}>010-3333-4444</Text>
            </View>
            <Text style={styles.riderNote}>
              💡 라이더에게 직접 연락하여 위치나 상황을 확인할 수 있습니다
            </Text>
          </Card>
        )}

        {/* 실시간 지도 */}
        <Card style={styles.mapCard}>
          <Text style={styles.mapTitle}>🗺️ 실시간 위치</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: request.pickup_latitude,
              longitude: request.pickup_longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            {/* 사용자/픽업 위치 마커 */}
            <Marker
              coordinate={{
                latitude: request.pickup_latitude,
                longitude: request.pickup_longitude,
              }}
              title="사용자 위치"
              description={`${request.pet?.name} 픽업 장소`}
            >
              <Text style={styles.markerIcon}>📍</Text>
            </Marker>

            {/* 병원 위치 마커 */}
            {request.hospital && (
              <Marker
                coordinate={{
                  latitude: request.hospital.latitude,
                  longitude: request.hospital.longitude,
                }}
                title={request.hospital.name}
                description="이송 병원"
              >
                <Text style={styles.markerIcon}>🏥</Text>
              </Marker>
            )}

            {/* 라이더 위치 마커 (라이더가 배정된 경우) */}
            {request.rider_id && (() => {
              const riderLocation = getRiderLocationForRequest(request.id);
              return (
                <Marker
                  coordinate={{
                    latitude: riderLocation.latitude,
                    longitude: riderLocation.longitude,
                  }}
                  title="라이더 위치"
                  description="박배달 (실시간)"
                >
                  <Text style={styles.markerIcon}>🚗</Text>
                </Marker>
              );
            })()}
          </MapView>
          <View style={styles.mapLegend}>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>📍</Text>
              <Text style={styles.legendText}>사용자</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>🏥</Text>
              <Text style={styles.legendText}>병원</Text>
            </View>
            {request.rider_id && (
              <View style={styles.legendItem}>
                <Text style={styles.legendIcon}>🚗</Text>
                <Text style={styles.legendText}>라이더</Text>
              </View>
            )}
          </View>
        </Card>

        {/* 취소 버튼 */}
        {canCancel && (
          <Button
            title="요청 취소"
            onPress={handleCancel}
            variant="outline"
            style={styles.cancelButton}
          />
        )}

        {/* 완료 버튼 */}
        {request.status === 'completed' && (
          <Button
            title="확인"
            onPress={() => navigation.navigate('GuardianHome')}
            style={styles.doneButton}
          />
        )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: spacing.lg,
  },
  errorText: {
    ...typography.h4,
    color: colors.error,
    marginBottom: spacing.lg,
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
  statusCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
  },
  statusIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  statusTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  statusDescription: {
    ...typography.body,
    color: colors.textSecondary,
  },
  progressCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  progressSteps: {
    paddingLeft: spacing.sm,
  },
  stepItem: {
    position: 'relative',
    paddingLeft: spacing.xl + spacing.md,
    paddingBottom: spacing.lg,
  },
  stepDot: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotCompleted: {
    backgroundColor: colors.success + '30',
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepIcon: {
    fontSize: 20,
  },
  stepInfo: {
    justifyContent: 'center',
    minHeight: 40,
  },
  stepTitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  stepTitleActive: {
    ...typography.h4,
    color: colors.primary,
  },
  stepLine: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: '100%',
    backgroundColor: colors.border,
  },
  stepLineCompleted: {
    backgroundColor: colors.success,
  },
  infoCard: {
    marginBottom: spacing.lg,
  },
  infoTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
    width: 80,
    fontWeight: '600',
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
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
  hospitalPhone: {
    ...typography.body,
    color: colors.primary,
  },
  riderNote: {
    ...typography.bodySmall,
    color: colors.info,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  mapCard: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  mapTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  mapLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  legendText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  cancelButton: {
    marginBottom: spacing.lg,
  },
  doneButton: {
    marginBottom: spacing.xl,
  },
  markerIcon: {
    fontSize: 40,
  },
});
