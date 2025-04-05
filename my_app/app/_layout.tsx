import { Stack } from "expo-router";
import { View, StyleSheet } from 'react-native';


export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center', // Align title to right for RTL        
      }}>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'بیمه یاب',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#4248fc',
            // Valid property
          },
          headerShadowVisible: false, // Use this instead of borderBottomWidth
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white',

          }
        }}
      />
      <Stack.Screen
        name="map"
        options={{
          headerTitle: 'نقشه',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#4248fc',
          },
          headerShadowVisible: false,
          headerTintColor :'white',
          headerTitleStyle: {
            fontSize: 20,
            fontWeight: 'bold',
            color: 'white',
          }
        }}
      />
    </Stack>
  );
}

