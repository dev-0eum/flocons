import { StyleSheet, Text, View } from 'react-native';

export interface PlaceholderProps {
  title: string;
  subtitle?: string;
}

/**
 * 스캐폴드용 임시 화면 컴포넌트. 실제 컴포넌트는 UoW-01(디자인 시스템)에서 대체된다.
 */
export function Placeholder({ title, subtitle }: PlaceholderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700' },
  subtitle: { marginTop: 8, fontSize: 14, opacity: 0.6, textAlign: 'center' },
});
