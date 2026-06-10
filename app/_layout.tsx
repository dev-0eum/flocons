import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { rehydrateCardStore } from '@/store/cardStore';

/**
 * 루트 레이아웃 (ADR-008): `(tabs)` 그룹 + 풀스크린 stack 라우트 혼합.
 * 학습/복습은 헤더 숨김(몰입), 설정은 헤더 표시.
 * GestureHandlerRootView로 감싸 스와이프 제스처(UoW-03)를 활성화.
 */
export default function RootLayout() {
  // 앱 시작 시 영속 학습 상태(SRS) 복원 (UoW-05).
  useEffect(() => {
    void rehydrateCardStore();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="learn" options={{ headerShown: false }} />
        <Stack.Screen name="review" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ title: '설정' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
