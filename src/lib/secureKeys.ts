import * as SecureStore from 'expo-secure-store';

// 비밀키 저장 — expo-secure-store 유일 접점 (ADR-004, HARNESS §5).
// 키 원문은 이 모듈 경계 밖으로 로그·직렬화·상태 저장하지 않는다.
// SecureStore 키는 영숫자·`.`·`-`·`_`만 허용 → AsyncStorage(`flocons:`)와 달리 점 표기.

export type KeyId = 'anthropic' | 'image';

const ITEM_NAME: Record<KeyId, string> = {
  anthropic: 'flocons.key.anthropic',
  image: 'flocons.key.image',
};

/** 키 저장. 실패(web 등 미지원 플랫폼) 시 조용히 무시. */
export async function setKey(id: KeyId, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(ITEM_NAME[id], value);
  } catch {
    // secure-store 미지원 환경 — no-op
  }
}

/** 키 원문 조회 — Provider 호출 직전에만 사용한다. 없거나 실패 시 null. */
export async function getKey(id: KeyId): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ITEM_NAME[id]);
  } catch {
    return null;
  }
}

/** 키 삭제. */
export async function deleteKey(id: KeyId): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(ITEM_NAME[id]);
  } catch {
    // no-op
  }
}

/** 키 존재 여부 — 상태/화면에는 이 boolean만 노출한다(ADR-004). */
export async function hasKey(id: KeyId): Promise<boolean> {
  return (await getKey(id)) !== null;
}
