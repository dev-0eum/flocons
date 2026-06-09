import type { WordCardData } from '@/components/WordCard';
import type { Word } from '@/content';

/**
 * 콘텐츠 `Word` → 프리젠테이셔널 `WordCardData` 매핑 (디커플 경계, Q-A2/Q-B2).
 * lib(글루) 계층에 두어 content가 components에 의존하지 않게 한다.
 */
export function toWordCardData(w: Word): WordCardData {
  return {
    lemma: w.lemma,
    article: w.article,
    gender: w.gender,
    pos: w.pos,
    krMeaning: w.krMeaning,
    exampleFr: w.exampleFr,
    exampleKr: w.exampleKr,
  };
}
