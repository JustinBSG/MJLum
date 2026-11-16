import { Stack } from 'expo-router';

export default function SessionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: '返回',
        headerTintColor: '#1E3A8A',
        headerStyle: { backgroundColor: '#FFFFFF' },
        contentStyle: { backgroundColor: '#F8FAFC' },
      }}
    />
  );
}
