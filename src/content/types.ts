// flocons 콘텐츠 계층 정규 타입 (DESIGN §4, word.schema.json과 1:1).

/** 품사. flocons-content 스키마 enum과 동일. 콘텐츠 계층의 정본(프리젠테이셔널 WordCard.Pos와는 분리). */
export type Pos =
  | 'n'
  | 'v'
  | 'adj'
  | 'adv'
  | 'prep'
  | 'pron'
  | 'conj'
  | 'num'
  | 'det'
  | 'intj'
  | 'phrase';

export type Gender = 'm' | 'f' | null;

export type Level = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

/** 단어 카드 콘텐츠(불변). 데이터셋/AI가 제공. */
export interface Word {
  id: string;
  lemma: string;
  article: string | null;
  gender: Gender;
  pos: Pos;
  krMeaning: string;
  level: Level;
  exampleFr: string;
  exampleKr: string;
  imageUrl?: string | null;
  /** 이미지 생성 모델용 프롬프트(영어 권장). 키 있으면 AIImageProvider가 렌더, 없으면 플레이스홀더. */
  imagePrompt?: string | null;
  tags?: string[];
}

/** 사용자 학습 상태(가변, 로컬 저장). 로직은 UoW-05(SRS). */
export interface CardState {
  wordId: string;
  status: 'new' | 'learning' | 'known';
  box: number;
  dueAt: number;
  reps: number;
  lapses: number;
  bookmarked: boolean;
  lastReviewedAt?: number;
}
