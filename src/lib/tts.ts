import * as Speech from 'expo-speech';

// 무료 온디바이스 발음 (expo-speech, fr-FR). expo-speech를 쓰는 유일 지점 (ADR-005).
// rate/voice 설정값 연동은 UoW-08(settingsStore). 지금은 인자 기본(시스템 기본).

const LANGUAGE = 'fr-FR';

export interface SpeakOptions {
  rate?: number;
  voice?: string;
}

/** 프랑스어 텍스트를 TTS로 재생. */
export function speak(text: string, opts: SpeakOptions = {}): void {
  Speech.speak(text, { language: LANGUAGE, rate: opts.rate, voice: opts.voice });
}

/** 재생 중지. */
export function stop(): void {
  Speech.stop();
}
