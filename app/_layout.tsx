import { Stack } from 'expo-router';

/**
 * 루트 레이아웃 (ADR-008): `(tabs)` 그룹 + 풀스크린 stack 라우트 혼합.
 * 학습/복습은 헤더 숨김(몰입), 설정은 헤더 표시.
 */
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="learn" options={{ headerShown: false }} />
      <Stack.Screen name="review" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ title: '설정' }} />
    </Stack>
  );
}
