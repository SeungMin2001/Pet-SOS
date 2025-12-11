import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Hospital } from '../../types';
import { colors, spacing, typography, borderRadius } from '../../utils/theme';

export const HospitalMapScreen: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const { hospital, userLocation } = route.params as {
    hospital: Hospital;
    userLocation: { latitude: number; longitude: number };
  };

  // 사용자와 병원 위치의 중간점 계산
  const centerLat = (userLocation.latitude + hospital.latitude) / 2;
  const centerLng = (userLocation.longitude + hospital.longitude) / 2;

  // 두 지점을 모두 포함하는 적절한 zoom level 계산
  const latDelta = Math.abs(userLocation.latitude - hospital.latitude) * 2.5;
  const lngDelta = Math.abs(userLocation.longitude - hospital.longitude) * 2.5;

  const handleNavigate = () => {
    // iOS: Apple Maps, Android: Google Maps
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    const url = Platform.OS === 'ios'
      ? `${scheme}?daddr=${hospital.latitude},${hospital.longitude}`
      : `${scheme}${hospital.latitude},${hospital.longitude}`;

    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 돌아가기</Text>
        </TouchableOpacity>
        <Text style={styles.title}>병원 위치</Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: centerLat,
            longitude: centerLng,
            latitudeDelta: Math.max(latDelta, 0.02),
            longitudeDelta: Math.max(lngDelta, 0.02),
          }}
        >
          {/* 사용자 위치 마커 */}
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="현재 위치"
            description="내 위치"
          >
            <Text style={styles.markerIcon}>📍</Text>
          </Marker>

          {/* 병원 위치 마커 */}
          <Marker
            coordinate={{
              latitude: hospital.latitude,
              longitude: hospital.longitude,
            }}
            title={hospital.name}
            description={hospital.address}
          >
            <Text style={styles.markerIcon}>🏥</Text>
          </Marker>
        </MapView>

        {/* 범례 */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>📍</Text>
            <Text style={styles.legendText}>현재 위치</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>🏥</Text>
            <Text style={styles.legendText}>병원</Text>
          </View>
        </View>
      </View>

      {/* 병원 정보 카드 */}
      <Card style={styles.infoCard}>
        <View style={styles.hospitalHeader}>
          <Text style={styles.hospitalName}>{hospital.name}</Text>
          {hospital.is_24hour && (
            <View style={styles.badge24}>
              <Text style={styles.badge24Text}>24시</Text>
            </View>
          )}
        </View>
        <Text style={styles.hospitalAddress}>{hospital.address}</Text>
        <Text style={styles.hospitalSpecialties}>📍 {hospital.specialties}</Text>
        <Text style={styles.hospitalPhone}>📞 {hospital.phone}</Text>

        <View style={styles.actions}>
          <Button
            title="전화 걸기"
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
            variant="outline"
            style={styles.actionButton}
          />
          <Button
            title="길찾기 시작"
            onPress={handleNavigate}
            style={styles.actionButton}
          />
        </View>
      </Card>
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
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  legend: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  legendIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  legendText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  infoCard: {
    margin: spacing.lg,
  },
  hospitalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  hospitalName: {
    ...typography.h3,
    color: colors.textPrimary,
    flex: 1,
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
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  hospitalSpecialties: {
    ...typography.body,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  hospitalPhone: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  markerIcon: {
    fontSize: 40,
  },
});
