import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Level } from '@/content';
import { type KeyId, deleteKey, hasKey, setKey } from '@/lib/secureKeys';

// 설정 스토어 — 모듈 상태 + subscribe 패턴 (UoW-05 결정 A).
// ttsRate·level만 AsyncStorage에 영속하고, hasKey 플래그는 직렬화하지 않고
// 기동 시 secure-store에서 파생한다 (ADR-004, Q-I3).

export const SETTINGS_KEY = 'flocons:settings:v1';
export const SETTINGS_VERSION = 1;

export interface SettingsState {
  ttsRate: number;
  level: Level;
  /** 첫 실행 온보딩 완료 여부 (UoW-11 — 영속). */
  onboarded: boolean;
  /** rehydrate 완료 여부 (비영속 — 온보딩 리다이렉트 오판 방지). */
  hydrated: boolean;
  hasAnthropicKey: boolean;
  hasImageKey: boolean;
}

const DEFAULTS: SettingsState = {
  ttsRate: 1.0,
  level: 'A1',
  onboarded: false,
  hydrated: false,
  hasAnthropicKey: false,
  hasImageKey: false,
};

/** 직렬화 포맷 — 영속 대상은 ttsRate·level·onboarded (키 플래그·hydrated 제외, ADR-004). */
interface PersistedSettings {
  version: number;
  state: { ttsRate: number; level: Level; onboarded: boolean };
}

let settings: SettingsState = { ...DEFAULTS };
const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((l) => l());
}

function persistNow(): void {
  // 비동기 persist (fire-and-forget)
  void AsyncStorage.setItem(
    SETTINGS_KEY,
    JSON.stringify({
      version: SETTINGS_VERSION,
      state: { ttsRate: settings.ttsRate, level: settings.level, onboarded: settings.onboarded },
    } satisfies PersistedSettings),
  );
}

/** 발음 속도 설정·영속. */
export function setTtsRate(rate: number): void {
  settings = { ...settings, ttsRate: rate };
  persistNow();
  emit();
}

/** 레벨 설정·영속 (UoW-11에서 useWords로 화면 연동 — Q-I2). */
export function setLevel(level: Level): void {
  settings = { ...settings, level };
  persistNow();
  emit();
}

/** 온보딩 완료 표시·영속 (UoW-11). */
export function setOnboarded(): void {
  settings = { ...settings, onboarded: true };
  persistNow();
  emit();
}

function flagName(id: KeyId): 'hasAnthropicKey' | 'hasImageKey' {
  return id === 'anthropic' ? 'hasAnthropicKey' : 'hasImageKey';
}

async function deriveFlag(id: KeyId): Promise<void> {
  const next = { ...settings };
  next[flagName(id)] = await hasKey(id);
  settings = next;
  emit();
}

/** 키 저장 + hasKey 갱신. 키 원문은 secure-store로만 전달(상태 저장 금지). */
export async function saveKey(id: KeyId, value: string): Promise<void> {
  await setKey(id, value);
  await deriveFlag(id);
}

/** 키 삭제 + hasKey 갱신 — Provider는 Static으로 회귀한다(DESIGN §5). */
export async function removeKey(id: KeyId): Promise<void> {
  await deleteKey(id);
  await deriveFlag(id);
}

/** secure-store에서 hasKey 플래그 재파생 (기동 시). */
export async function refreshKeyFlags(): Promise<void> {
  const [anthropic, image] = await Promise.all([hasKey('anthropic'), hasKey('image')]);
  settings = { ...settings, hasAnthropicKey: anthropic, hasImageKey: image };
  emit();
}

/** 저장된 설정 복원 + 키 플래그 파생 (앱 시작 시 한 번 호출 — app/_layout). */
export async function rehydrateSettings(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PersistedSettings;
      // migrate: v1 그대로 사용. 이후 스키마 변경 시 version 분기 추가.
      if (parsed.version === SETTINGS_VERSION && parsed.state) {
        settings = {
          ...settings,
          ttsRate: parsed.state.ttsRate ?? DEFAULTS.ttsRate,
          level: parsed.state.level ?? DEFAULTS.level,
          onboarded: parsed.state.onboarded ?? false, // 구 저장본 후방 호환
        };
      }
    }
  } catch {
    // 저장 데이터 손상 시 기본값 유지
  }
  await refreshKeyFlags();
  settings = { ...settings, hydrated: true }; // 리다이렉트 판단 가능 시점 표시
  emit();
}

/** 테스트 전용: 메모리 상태만 기본값으로 (저장본·secure-store는 건드리지 않음). */
export function resetSettingsForTest(): void {
  settings = { ...DEFAULTS };
  emit();
}

/** 현재 설정 스냅샷. */
export const getSettings = (): SettingsState => settings;

/** 변경 구독. 해제 함수 반환. */
export function subscribeSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
