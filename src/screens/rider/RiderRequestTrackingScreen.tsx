import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { ridersAPI } from '../../services/api';
import { EmergencyRequest } from '../../types';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';
import { getRiderLocationForRequest } from '../../data/mockData';

export const RiderRequestTrackingScreen: React.FC<{
  navigation: any;
  route: any;
}> = ({ navigation, route }) => {
  const { requestId } = route.params;
  const [request, setRequest] = useState<EmergencyRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequest();
    // 실시간 업데이트를 위한 폴링
    const interval = setInterval(loadRequest, 3000);
    return () => clearInterval(interval);
  }, [requestId]);

  const loadRequest = async () => {
    try {
      const requests = await ridersAPI.getMyRiderRequests();
      const found = requests.find((r) => r.id === requestId);
      if (found) {
        setRequest(found);
      }
    } catch (error) {
      console.error('Failed to load request:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await ridersAPI.updateRequestStatus(requestId, status);
      await loadRequest();

      if (status === 'completed') {
        Alert.alert('완료', '이송이 완료되었습니다.', [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('성공', '상태가 업데이트되었습니다.', [
          {
            text: '확인',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      Alert.alert('오류', '상태 업데이트에 실패했습니다.');
    }
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

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: { [key: string]: string } = {
      rider_assigned: 'picking_up',
      picking_up: 'on_way_to_hospital',
      on_way_to_hospital: 'completed',
    };
    return statusFlow[currentStatus];
  };

  const getNextStatusText = (currentStatus: string) => {
    const textMap: { [key: string]: string } = {
      rider_assigned: '픽업 시작',
      picking_up: '병원으로 출발',
      on_way_to_hospital: '완료',
    };
    return textMap[currentStatus];
  };

  const getSizeText = (size?: string) => {
    if (!size) return '';
    const sizeMap: { [key: string]: string } = {
      small: '소형',
      medium: '중형',
      large: '대형',
    };
    return sizeMap[size] || '';
  };

  if (loading || !request) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  // 라이더 위치 가져오기
  const riderLocation = getRiderLocationForRequest(request.id);

  // 지도의 중심과 줌 레벨 계산
  const allLatitudes = [
    request.pickup_latitude,
    request.hospital?.latitude || 0,
    riderLocation.latitude,
  ];
  const allLongitudes = [
    request.pickup_longitude,
    request.hospital?.longitude || 0,
    riderLocation.longitude,
  ];

  const minLat = Math.min(...allLatitudes);
  const maxLat = Math.max(...allLatitudes);
  const minLng = Math.min(...allLongitudes);
  const maxLng = Math.max(...allLongitudes);

  const centerLat = (minLat + maxLat) / 2;
  const centerLng = (minLng + maxLng) / 2;
  const latDelta = Math.max((maxLat - minLat) * 1.5, 0.02);
  const lngDelta = Math.max((maxLng - minLng) * 1.5, 0.02);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        }}
      >
        {/* 픽업 위치 (사용자 위치) 마커 */}
        <Marker
          coordinate={{
            latitude: request.pickup_latitude,
            longitude: request.pickup_longitude,
          }}
          title="픽업 위치"
          description={`${request.user?.name} - ${request.pet?.name}`}
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
            description="목적지 병원"
          >
            <Text style={styles.markerIcon}>🏥</Text>
          </Marker>
        )}

        {/* 라이더 위치 마커 */}
        <Marker
          coordinate={{
            latitude: riderLocation.latitude,
            longitude: riderLocation.longitude,
          }}
          title="내 위치"
          description="라이더 (실시간)"
        >
          <Text style={styles.markerIcon}>🚗</Text>
        </Marker>
      </MapView>

      {/* 정보 카드 */}
      <ScrollView style={styles.infoContainer}>
        <Card style={styles.infoCard}>
          {/* 상태 */}
          <View style={styles.statusRow}>
            <Text style={styles.label}>상태</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <Text style={[styles.statusText, { color: colors.primary }]}>
                {getStatusText(request.status)}
              </Text>
            </View>
          </View>

          {/* 보호자 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>보호자 정보</Text>
            <Text style={styles.infoText}>{request.user?.name}</Text>
            <Text style={styles.infoSubText}>{request.user?.phone}</Text>
          </View>

          {/* 반려동물 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>반려동물 정보</Text>
            <Text style={styles.infoText}>
              {request.pet?.name} ({request.pet?.species})
            </Text>
            {(request.pet?.weight || request.pet?.size) && (
              <Text style={styles.infoSubText}>
                {getSizeText(request.pet?.size)}
                {request.pet?.size && request.pet?.weight && ' • '}
                {request.pet?.weight && `${request.pet.weight}kg`}
              </Text>
            )}
            {request.pet?.medical_notes && (
              <Text style={styles.warningText}>
                ⚠️ {request.pet.medical_notes}
              </Text>
            )}
          </View>

          {/* 증상 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>증상</Text>
            <Text style={styles.infoText}>{request.symptoms}</Text>
          </View>

          {/* 목적지 병원 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>목적지 병원</Text>
            <Text style={styles.infoText}>{request.hospital?.name}</Text>
            <Text style={styles.infoSubText}>{request.hospital?.address}</Text>
          </View>

          {/* 범례 */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>📍</Text>
              <Text style={styles.legendText}>픽업 위치</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>🏥</Text>
              <Text style={styles.legendText}>목적지 병원</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.legendIcon}>🚗</Text>
              <Text style={styles.legendText}>내 위치</Text>
            </View>
          </View>

          {/* 상태 업데이트 버튼 */}
          {getNextStatus(request.status) && (
            <Button
              title={getNextStatusText(request.status)}
              onPress={() => updateStatus(getNextStatus(request.status))}
              style={styles.actionButton}
            />
          )}

          {/* 완료 후 홈으로 돌아가기 */}
          {request.status === 'completed' && (
            <Button
              title="홈으로 돌아가기"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.actionButton}
            />
          )}
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
  map: {
    height: '40%',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  infoContainer: {
    flex: 1,
  },
  infoCard: {
    margin: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    fontWeight: '600',
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
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  infoSubText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.warning,
    marginTop: spacing.xs,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.md,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  legendText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  markerIcon: {
    fontSize: 40,
  },
});
