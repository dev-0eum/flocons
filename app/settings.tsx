import { useState, type ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import type { Level } from '@/content';
import type { KeyId } from '@/lib/secureKeys';
import { resetCards } from '@/store/cardStore';
import { useSettings } from '@/store/hooks';
import { removeKey, saveKey, setLevel, setTtsRate } from '@/store/settingsStore';
import { resetStudyLog } from '@/store/studyLog';
import { colors, radius, spacing, typography } from '@/theme';

// 설정: TTS 속도 · 레벨 · API 키(secure-store) · 데이터 초기화 (DESIGN §3, UoW-08).
// 키 원문은 secure-store에만 — 화면엔 hasKey 배지만 표시하고, 저장 즉시 입력칸을 비운다(ADR-004).

const RATE_PRESETS = [
  { label: '느리게', value: 0.75 },
  { label: '보통', value: 1.0 },
  { label: '빠르게', value: 1.25 },
] as const;

const LEVELS: Level[] = ['A1', 'A2', 'B1'];

export default function SettingsScreen() {
  const { ttsRate, level, hasAnthropicKey, hasImageKey } = useSettings();

  // 학습 데이터만 초기화 — API 키는 유지 (Inception Q4, Q-I4).
  const confirmReset = () => {
    Alert.alert('데이터 초기화', '학습 기록(SRS·학습일)을 모두 지웁니다. API 키는 유지됩니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '초기화',
        style: 'destructive',
        onPress: () => {
          resetCards();
          resetStudyLog();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Section title="발음 속도">
        <View style={styles.segment}>
          {RATE_PRESETS.map((p) => (
            <SegmentItem
              key={p.value}
              label={p.label}
              a11yLabel={`발음 속도 ${p.label}`}
              selected={ttsRate === p.value}
              onPress={() => setTtsRate(p.value)}
            />
          ))}
        </View>
      </Section>

      <Section title="레벨" caption="학습 화면 적용은 추후 업데이트에서 연동돼요(UoW-11).">
        <View style={styles.segment}>
          {LEVELS.map((l) => (
            <SegmentItem
              key={l}
              label={l}
              a11yLabel={`레벨 ${l}`}
              selected={level === l}
              onPress={() => setLevel(l)}
            />
          ))}
        </View>
      </Section>

      <Section title="API 키" caption="키는 기기 보안 저장소(secure-store)에만 저장돼요.">
        <KeyField id="anthropic" label="Anthropic 키" hasKey={hasAnthropicKey} />
        <KeyField id="image" label="이미지 생성 키" hasKey={hasImageKey} />
      </Section>

      <Section title="데이터">
        <Pressable
          style={styles.dangerButton}
          onPress={confirmReset}
          accessibilityRole="button"
          accessibilityLabel="데이터 초기화"
        >
          <Text style={styles.dangerLabel}>데이터 초기화</Text>
        </Pressable>
      </Section>
    </ScrollView>
  );
}

/** 설정 섹션 래퍼 (화면 내부 전용). */
function Section({ title, caption, children }: { title: string; caption?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {caption ? <Text style={styles.sectionCaption}>{caption}</Text> : null}
      {children}
    </View>
  );
}

/** 세그먼트 버튼 (프리셋 선택 — 슬라이더 의존성 없음, Q-I1). */
function SegmentItem({
  label,
  a11yLabel,
  selected,
  onPress,
}: {
  label: string;
  a11yLabel: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.segmentItem, selected && styles.segmentItemActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
      accessibilityState={{ selected }}
    >
      <Text style={[styles.segmentLabel, selected && styles.segmentLabelActive]}>{label}</Text>
    </Pressable>
  );
}

/** API 키 입력 필드 — 원문은 로컬 state에만 잠시 존재, 저장 즉시 클리어(ADR-004). */
function KeyField({ id, label, hasKey }: { id: KeyId; label: string; hasKey: boolean }) {
  const [value, setValue] = useState('');

  const onSave = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    await saveKey(id, trimmed);
    setValue(''); // 평문 체류 최소화
  };

  return (
    <View style={styles.keyField}>
      <View style={styles.keyHeader}>
        <Text style={styles.keyLabel}>{label}</Text>
        <Text style={[styles.keyBadge, hasKey && styles.keyBadgeOn]}>
          {hasKey ? '저장됨' : '없음'}
        </Text>
      </View>
      <TextInput
        style={styles.keyInput}
        value={value}
        onChangeText={setValue}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="키 입력"
        placeholderTextColor={colors.textMuted}
        accessibilityLabel={`${label} 입력`}
      />
      <View style={styles.keyActions}>
        <Pressable
          style={styles.keyButton}
          onPress={() => void onSave()}
          accessibilityRole="button"
          accessibilityLabel={`${label} 저장`}
        >
          <Text style={styles.keyButtonLabel}>저장</Text>
        </Pressable>
        {hasKey ? (
          <Pressable
            style={[styles.keyButton, styles.keyButtonGhost]}
            onPress={() => void removeKey(id)}
            accessibilityRole="button"
            accessibilityLabel={`${label} 삭제`}
          >
            <Text style={styles.keyButtonGhostLabel}>삭제</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.bodyStrong, color: colors.text },
  sectionCaption: { ...typography.caption, color: colors.textMuted },
  segment: { flexDirection: 'row', gap: spacing.sm },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  segmentItemActive: { backgroundColor: colors.accent },
  segmentLabel: { ...typography.body, color: colors.text },
  segmentLabelActive: { ...typography.bodyStrong, color: colors.onAccent },
  keyField: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  keyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  keyLabel: { ...typography.bodyStrong, color: colors.text },
  keyBadge: { ...typography.badge, color: colors.textMuted },
  keyBadgeOn: { color: colors.articleMasculine },
  keyInput: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  keyActions: { flexDirection: 'row', gap: spacing.sm },
  keyButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  keyButtonLabel: { ...typography.bodyStrong, color: colors.onAccent },
  keyButtonGhost: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border },
  keyButtonGhostLabel: { ...typography.body, color: colors.text },
  dangerButton: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  dangerLabel: { ...typography.bodyStrong, color: colors.danger },
});
