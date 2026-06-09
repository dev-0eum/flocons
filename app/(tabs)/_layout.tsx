import { Tabs } from 'expo-router';

/** 진입형 탭: 홈 / 통계 / 북마크 (UoW-01 디자인 시스템에서 아이콘·테마 적용). */
export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="stats" options={{ title: '통계' }} />
      <Tabs.Screen name="bookmarks" options={{ title: '북마크' }} />
    </Tabs>
  );
}
