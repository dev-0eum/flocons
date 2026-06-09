// 데이터셋 유효성 검증 — 앱 런타임/테스트의 정본.
// flocons-content 스킬 scripts/validate.mjs 와 **동일 규칙**(드리프트 시 함께 갱신).

const POS = ['n', 'v', 'adj', 'adv', 'prep', 'pron', 'conj', 'num', 'det', 'intj', 'phrase'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const GENDERS: (string | null)[] = ['m', 'f', null];
const REQUIRED_STRINGS = ['id', 'lemma', 'krMeaning', 'level', 'exampleFr', 'exampleKr'];

export interface ValidationResult {
  errors: string[];
  warnings: string[];
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim() !== '';
}

/** Word[] 후보를 검증한다. errors가 비어 있으면 유효. */
export function validateWords(data: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(data)) {
    errors.push('최상위 값이 배열(Word[])이 아닙니다.');
    return { errors, warnings };
  }

  const seen = new Map<string, number>();

  data.forEach((item, i) => {
    const idForLoc = item && typeof item === 'object' && isNonEmptyString((item as Record<string, unknown>).id)
      ? String((item as Record<string, unknown>).id)
      : '(id 없음)';
    const loc = `[#${i} ${idForLoc}]`;

    if (item === null || typeof item !== 'object' || Array.isArray(item)) {
      errors.push(`${loc} 항목이 객체가 아닙니다.`);
      return;
    }
    const w = item as Record<string, unknown>;

    for (const f of REQUIRED_STRINGS) {
      if (!(f in w)) errors.push(`${loc} 필수 필드 누락: "${f}"`);
      else if (typeof w[f] !== 'string') errors.push(`${loc} "${f}"는 문자열이어야 합니다.`);
      else if ((w[f] as string).trim() === '') errors.push(`${loc} "${f}"가 빈 문자열입니다.`);
    }

    if (!('article' in w)) errors.push(`${loc} 필수 필드 누락: "article" (string|null).`);
    else if (w.article !== null && typeof w.article !== 'string')
      errors.push(`${loc} "article"는 string 또는 null 이어야 합니다.`);
    else if (typeof w.article === 'string' && w.article.trim() === '')
      errors.push(`${loc} "article"가 빈 문자열입니다 (성 없음이면 null 사용).`);

    if (!('gender' in w)) errors.push(`${loc} 필수 필드 누락: "gender" (m|f|null).`);
    else if (!GENDERS.includes(w.gender as string | null))
      errors.push(`${loc} "gender" 값이 잘못됨: ${JSON.stringify(w.gender)}.`);

    if (!('pos' in w)) errors.push(`${loc} 필수 필드 누락: "pos".`);
    else if (typeof w.pos !== 'string' || !POS.includes(w.pos))
      errors.push(`${loc} "pos" 값이 잘못됨: ${JSON.stringify(w.pos)}.`);

    if (typeof w.level === 'string' && !LEVELS.includes(w.level))
      errors.push(`${loc} "level" 값이 잘못됨: ${JSON.stringify(w.level)}.`);

    if ('imageUrl' in w && w.imageUrl !== null && typeof w.imageUrl !== 'string')
      errors.push(`${loc} "imageUrl"는 string 또는 null 이어야 합니다.`);
    if ('imagePrompt' in w && w.imagePrompt !== null && typeof w.imagePrompt !== 'string')
      errors.push(`${loc} "imagePrompt"는 string 또는 null 이어야 합니다.`);

    if ('tags' in w) {
      if (!Array.isArray(w.tags)) errors.push(`${loc} "tags"는 문자열 배열이어야 합니다.`);
      else
        w.tags.forEach((t, ti) => {
          if (!isNonEmptyString(t)) errors.push(`${loc} "tags[${ti}]"는 비어 있지 않은 문자열.`);
        });
    }

    if (isNonEmptyString(w.id)) {
      if (seen.has(w.id)) errors.push(`${loc} 중복 id: "${w.id}" (최초 #${seen.get(w.id)}).`);
      else seen.set(w.id, i);
    }

    // 관사-성 정합: le/un↔m, la/une↔f 명백한 불일치는 오류, l'/les 등은 경고.
    if (typeof w.article === 'string' && (w.gender === 'm' || w.gender === 'f')) {
      const a = w.article.trim().toLowerCase();
      const masc = ['le', 'un'];
      const fem = ['la', 'une'];
      if (masc.includes(a) && w.gender !== 'm')
        errors.push(`${loc} 관사 "${w.article}"는 남성(m)인데 gender="${w.gender}" — 관사-성 불일치.`);
      else if (fem.includes(a) && w.gender !== 'f')
        errors.push(`${loc} 관사 "${w.article}"는 여성(f)인데 gender="${w.gender}" — 관사-성 불일치.`);
      else if (!masc.includes(a) && !fem.includes(a))
        warnings.push(`${loc} 관사 "${w.article}"로는 성을 자동 확인할 수 없습니다.`);
    }
  });

  return { errors, warnings };
}
