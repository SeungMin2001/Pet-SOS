import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { colors } from '../utils/theme';

const Stack = createStackNavigator();

import { GuardianHomeScreen } from '../screens/guardian/GuardianHomeScreen';
import { AddPetScreen } from '../screens/guardian/AddPetScreen';
import { EmergencyCallScreen } from '../screens/guardian/EmergencyCallScreen';
import { RequestTrackingScreen } from '../screens/guardian/RequestTrackingScreen';
import { HospitalMapScreen } from '../screens/guardian/HospitalMapScreen';
import { RiderHomeScreen } from '../screens/rider/RiderHomeScreen';
import { RiderRequestTrackingScreen } from '../screens/rider/RiderRequestTrackingScreen';

export const RootNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : user.user_type === 'guardian' ? (
          <>
            <Stack.Screen name="GuardianHome" component={GuardianHomeScreen} />
            <Stack.Screen
              name="AddPet"
              component={AddPetScreen}
              options={{
                headerShown: true,
                title: '반려동물 추가',
                headerBackTitle: '뒤로',
              }}
            />
            <Stack.Screen
              name="EmergencyCall"
              component={EmergencyCallScreen}
              options={{
                headerShown: true,
                title: '긴급 호출',
                headerBackTitle: '뒤로',
              }}
            />
            <Stack.Screen
              name="RequestTracking"
              component={RequestTrackingScreen}
              options={{
                headerShown: true,
                title: '요청 추적',
                headerBackTitle: '뒤로',
              }}
            />
            <Stack.Screen
              name="HospitalMap"
              component={HospitalMapScreen}
              options={{
                headerShown: true,
                title: '병원 위치',
                headerBackTitle: '뒤로',
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="RiderHome" component={RiderHomeScreen} />
            <Stack.Screen
              name="RiderRequestTracking"
              component={RiderRequestTrackingScreen}
              options={{
                headerShown: true,
                title: '요청 추적',
                headerBackTitle: '뒤로',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
