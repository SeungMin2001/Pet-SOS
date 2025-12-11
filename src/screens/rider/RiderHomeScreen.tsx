import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  RefreshControl,
} from 'react-native';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { ridersAPI } from '../../services/api';
import { EmergencyRequest } from '../../types';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';

export const RiderHomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [availableRequests, setAvailableRequests] = useState<EmergencyRequest[]>([]);
  const [myRequests, setMyRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isActive) {
      loadRequests();
      const interval = setInterval(loadRequests, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const loadRequests = async () => {
    try {
      const [available, mine] = await Promise.all([
        ridersAPI.getAvailableRequests(),
        ridersAPI.getMyRiderRequests(),
      ]);
      setAvailableRequests(available);
      setMyRequests(mine);
    } catch (error) {
      console.error('Failed to load requests:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleActive = async (value: boolean) => {
    setLoading(true);
    try {
      // Use dummy location (Seoul City Hall)
      await ridersAPI.updateActiveStatus(37.5665, 126.9780, value);
      setIsActive(value);
      if (value) {
        loadRequests();
      }
    } catch (error) {
      Alert.alert('오류', '상태 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId: number) => {
    try {
      await ridersAPI.acceptRequest(requestId);
      Alert.alert('성공', '요청을 수락했습니다.', [
        {
          text: '확인',
          onPress: () => {
            navigation.navigate('RiderRequestTracking', { requestId });
          },
        },
      ]);
      loadRequests();
    } catch (error: any) {
      Alert.alert(
        '오류',
        error.response?.data?.detail || '요청 수락에 실패했습니다.'
      );
    }
  };

  const updateStatus = async (requestId: number, status: string) => {
    try {
      await ridersAPI.updateRequestStatus(requestId, status);
      await loadRequests();

      // 상태 업데이트 후 지도 화면으로 이동
      Alert.alert('성공', '상태가 업데이트되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            navigation.navigate('RiderRequestTracking', { requestId });
          },
        },
      ]);
    } catch (error) {
      Alert.alert('오류', '상태 업데이트에 실패했습니다.');
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: '대기 중',
      rider_assigned: '배정됨',
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

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>라이더</Text>
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
        {/* Active Status Toggle */}
        <Card style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View>
              <Text style={styles.statusTitle}>활성화 상태</Text>
              <Text style={styles.statusSubtitle}>
                {isActive ? '요청을 받을 수 있습니다' : '요청을 받지 않습니다'}
              </Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={toggleActive}
              trackColor={{ false: colors.gray300, true: colors.primary + '80' }}
              thumbColor={isActive ? colors.primary : colors.gray400}
              disabled={loading}
            />
          </View>
        </Card>

        {/* My Active Requests */}
        {myRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>진행 중인 이송</Text>
            {myRequests.map((request) => (
              <Card key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestId}>요청 #{request.id}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: colors.primary + '20' },
                    ]}
                  >
                    <Text style={[styles.statusBadgeText, { color: colors.primary }]}>
                      {getStatusText(request.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.requestInfo}>
                  <Text style={styles.infoLabel}>보호자</Text>
                  <Text style={styles.infoValue}>{request.user?.name}</Text>
                  <Text style={styles.infoValue}>{request.user?.phone}</Text>
                </View>

                <View style={styles.requestInfo}>
                  <Text style={styles.infoLabel}>반려동물</Text>
                  <Text style={styles.infoValue}>
                    {request.pet?.name} ({request.pet?.species})
                  </Text>
                  {(request.pet?.weight || request.pet?.size) && (
                    <Text style={styles.infoSubValue}>
                      {request.pet?.size === 'small' && '소형'}
                      {request.pet?.size === 'medium' && '중형'}
                      {request.pet?.size === 'large' && '대형'}
                      {request.pet?.size && request.pet?.weight && ' • '}
                      {request.pet?.weight && `${request.pet.weight}kg`}
                    </Text>
                  )}
                </View>

                <View style={styles.requestInfo}>
                  <Text style={styles.infoLabel}>증상</Text>
                  <Text style={styles.infoValue}>{request.symptoms}</Text>
                </View>

                <View style={styles.requestInfo}>
                  <Text style={styles.infoLabel}>목적지 병원</Text>
                  <Text style={styles.infoValue}>{request.hospital?.name}</Text>
                  <Text style={styles.infoSubValue}>{request.hospital?.address}</Text>
                </View>

                <View style={styles.buttonRow}>
                  <Button
                    title="지도 보기"
                    onPress={() =>
                      navigation.navigate('RiderRequestTracking', {
                        requestId: request.id,
                      })
                    }
                    variant="outline"
                    style={styles.mapButton}
                  />
                  {getNextStatus(request.status) && (
                    <Button
                      title={getNextStatusText(request.status)}
                      onPress={() =>
                        updateStatus(request.id, getNextStatus(request.status))
                      }
                      style={styles.statusButton}
                    />
                  )}
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Available Requests */}
        {isActive && availableRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>수락 가능한 요청</Text>
            {availableRequests.map((request) => (
              <Card key={request.id} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <Text style={styles.requestId}>요청 #{request.id}</Text>
                  <Text style={styles.requestTime}>
                    {new Date(request.created_at).toLocaleTimeString('ko-KR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                <View style={styles.requestInfo}>
                  <Text style={styles.infoLabel}>반려동물</Text>
                  <Text style={styles.infoValue}>
                    {request.pet?.name} ({request.pet?.species})
                  </Text>
                  {(request.pet?.weight || request.pet?.size) && (
                    <Text style={styles.infoSubValue}>
                      {request.pet?.size === 'small' && '소형'}
                      {request.pet?.size === 'medium' && '중형'}
                      {request.pet?.size === 'large' && '대형'}
                      {request.pet?.size && request.pet?.weight && ' • '}
                      {request.pet?.weight && `${request.pet.weight}kg`}
                    </Text>
                  )}
                </View>

                <View style={styles.requestInfo}>
                  <Text style={styles.infoLabel}>증상</Text>
                  <Text style={styles.infoValue}>{request.symptoms}</Text>
                </View>

                <View style={styles.requestInfo}>
                  <Text style={styles.infoLabel}>목적지 병원</Text>
                  <Text style={styles.infoValue}>{request.hospital?.name}</Text>
                  <Text style={styles.infoSubValue}>{request.hospital?.address}</Text>
                </View>

                <View style={styles.buttonRow}>
                  <Button
                    title="수락"
                    onPress={() => acceptRequest(request.id)}
                    style={styles.acceptButton}
                  />
                  <Button
                    title="거절"
                    onPress={() => {}}
                    variant="outline"
                    style={styles.rejectButton}
                  />
                </View>
              </Card>
            ))}
          </View>
        )}

        {isActive && availableRequests.length === 0 && myRequests.length === 0 && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>현재 수락 가능한 요청이 없습니다</Text>
            <Text style={styles.emptySubtext}>새 요청이 들어오면 알려드릴게요</Text>
          </Card>
        )}

        {!isActive && (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>💤</Text>
            <Text style={styles.emptyText}>현재 비활성화 상태입니다</Text>
            <Text style={styles.emptySubtext}>
              활성화하면 요청을 받을 수 있습니다
            </Text>
          </Card>
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
  statusCard: {
    marginBottom: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statusSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  requestCard: {
    marginBottom: spacing.md,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  requestId: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  requestTime: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  requestInfo: {
    marginBottom: spacing.md,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  infoSubValue: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  acceptButton: {
    flex: 1,
  },
  rejectButton: {
    flex: 1,
  },
  mapButton: {
    flex: 1,
  },
  statusButton: {
    flex: 1,
  },
  emptyCard: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  emptyText: {
    ...typography.h4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
