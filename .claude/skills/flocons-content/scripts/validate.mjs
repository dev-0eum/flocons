#!/usr/bin/env node
// flocons-content: Word 데이터셋 검증기
// 의존성 0개의 순수 Node(ESM). 실행:
//   node .claude/skills/flocons-content/scripts/validate.mjs <path/to/dataset.json>
//
// 검사: 필수 필드 존재/타입, pos·level·gender enum, 중복 id, 빈 문자열,
//       관사-성 정합(le/un→m, la/une→f 명백한 불일치는 오류; l'·les 등 모호 케이스는 경고).
// 오류가 있으면 사람이 읽을 요약을 출력하고 process.exit(1).
// 모호한 경우(l'·les 등 관사로 성 판별 불가)는 hard-fail 대신 warning.

import { readFile } from 'node:fs/promises';

const POS = ['n', 'v', 'adj', 'adv', 'prep', 'pron', 'conj', 'num', 'det', 'intj', 'phrase'];
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'];
const GENDERS = ['m', 'f', null];
const REQUIRED_STRINGS = [
  'id',
  'lemma',
  'krMeaning',
  'level',
  'exampleFr',
  'exampleKr',
];

const errors = [];
const warnings = [];

function err(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

function loc(i, w) {
  const id = w && typeof w.id === 'string' && w.id ? w.id : '(id 없음)';
  return `[#${i} ${id}]`;
}

function isString(v) {
  return typeof v === 'string';
}

async function main() {
  const path = process.argv[2];
  if (!path) {
    console.error(
      '사용법: node validate.mjs <dataset.json>\n  검증할 JSON 파일 경로를 인자로 전달하세요.',
    );
    process.exit(1);
  }

  let raw;
  try {
    raw = await readFile(path, 'utf8');
  } catch (e) {
    console.error(`파일을 읽을 수 없습니다: ${path}\n  ${e.message}`);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error(`JSON 파싱 실패: ${path}\n  ${e.message}`);
    process.exit(1);
  }

  if (!Array.isArray(data)) {
    console.error('최상위 값이 배열(Word[])이 아닙니다.');
    process.exit(1);
  }

  const seenIds = new Map(); // id -> 최초 인덱스

  data.forEach((w, i) => {
    if (w === null || typeof w !== 'object' || Array.isArray(w)) {
      err(`${loc(i, null)} 항목이 객체가 아닙니다.`);
      return;
    }

    // 필수 string 필드: 존재 + 타입 + 빈 문자열 금지
    for (const f of REQUIRED_STRINGS) {
      if (!(f in w)) {
        err(`${loc(i, w)} 필수 필드 누락: "${f}"`);
      } else if (!isString(w[f])) {
        err(`${loc(i, w)} 필드 "${f}"는 문자열이어야 합니다 (현재: ${typeof w[f]}).`);
      } else if (w[f].trim() === '') {
        err(`${loc(i, w)} 필드 "${f}"가 빈 문자열입니다.`);
      }
    }

    // article: string | null (필수 키, null 허용)
    if (!('article' in w)) {
      err(`${loc(i, w)} 필수 필드 누락: "article" (string 또는 null).`);
    } else if (w.article !== null && !isString(w.article)) {
      err(`${loc(i, w)} "article"는 string 또는 null 이어야 합니다.`);
    } else if (isString(w.article) && w.article.trim() === '') {
      err(`${loc(i, w)} "article"가 빈 문자열입니다 (성 없음이면 null 사용).`);
    }

    // gender: 'm' | 'f' | null (필수 키)
    if (!('gender' in w)) {
      err(`${loc(i, w)} 필수 필드 누락: "gender" (m | f | null).`);
    } else if (!GENDERS.includes(w.gender)) {
      err(`${loc(i, w)} "gender" 값이 잘못됨: ${JSON.stringify(w.gender)} (허용: m | f | null).`);
    }

    // pos enum
    if (!('pos' in w)) {
      err(`${loc(i, w)} 필수 필드 누락: "pos".`);
    } else if (!POS.includes(w.pos)) {
      err(`${loc(i, w)} "pos" 값이 잘못됨: ${JSON.stringify(w.pos)} (허용: ${POS.join(', ')}).`);
    }

    // level enum
    if (isString(w.level) && !LEVELS.includes(w.level)) {
      err(`${loc(i, w)} "level" 값이 잘못됨: ${JSON.stringify(w.level)} (허용: ${LEVELS.join(', ')}).`);
    }

    // 선택 필드: imageUrl
    if ('imageUrl' in w && w.imageUrl !== null && !isString(w.imageUrl)) {
      err(`${loc(i, w)} "imageUrl"는 string 또는 null 이어야 합니다.`);
    }

    // 선택 필드: imagePrompt
    if ('imagePrompt' in w && w.imagePrompt !== null && !isString(w.imagePrompt)) {
      err(`${loc(i, w)} "imagePrompt"는 string 또는 null 이어야 합니다.`);
    }

    // 선택 필드: tags
    if ('tags' in w) {
      if (!Array.isArray(w.tags)) {
        err(`${loc(i, w)} "tags"는 문자열 배열이어야 합니다.`);
      } else {
        w.tags.forEach((t, ti) => {
          if (!isString(t) || t.trim() === '') {
            err(`${loc(i, w)} "tags[${ti}]"는 비어 있지 않은 문자열이어야 합니다.`);
          }
        });
      }
    }

    // 중복 id
    if (isString(w.id) && w.id.trim() !== '') {
      if (seenIds.has(w.id)) {
        err(`${loc(i, w)} 중복 id: "${w.id}" (최초 #${seenIds.get(w.id)}).`);
      } else {
        seenIds.set(w.id, i);
      }
    }

    // 기본 관사-성 정합 (le/un→m, la/une→f). l'·les 등은 모호 → warning만.
    if (isString(w.article) && (w.gender === 'm' || w.gender === 'f')) {
      const a = w.article.trim().toLowerCase();
      const masc = ['le', 'un'];
      const fem = ['la', 'une'];
      if (masc.includes(a) && w.gender !== 'm') {
        err(`${loc(i, w)} 관사 "${w.article}"는 남성(m)인데 gender="${w.gender}" — 관사-성 불일치.`);
      } else if (fem.includes(a) && w.gender !== 'f') {
        err(`${loc(i, w)} 관사 "${w.article}"는 여성(f)인데 gender="${w.gender}" — 관사-성 불일치.`);
      } else if (!masc.includes(a) && !fem.includes(a)) {
        // l', les 등: 관사로 성 판별 불가 → 정보성 경고
        warn(`${loc(i, w)} 관사 "${w.article}"로는 성을 자동 확인할 수 없습니다 (gender="${w.gender}" 직접 확인 요망).`);
      }
    }
  });

  // 결과 출력
  const total = data.length;
  if (warnings.length > 0) {
    console.warn(`\n경고 ${warnings.length}건:`);
    for (const m of warnings) console.warn(`  ⚠️  ${m}`);
  }

  if (errors.length > 0) {
    console.error(`\n오류 ${errors.length}건:`);
    for (const m of errors) console.error(`  ✗ ${m}`);
    console.error(`\n검증 실패: ${path} (${total}개 항목, 오류 ${errors.length} / 경고 ${warnings.length}).`);
    process.exit(1);
  }

  console.log(
    `검증 통과: ${path} — ${total}개 항목, 오류 0` +
      (warnings.length ? `, 경고 ${warnings.length}` : '') +
      '.',
  );
}

main().catch((e) => {
  console.error(`예상치 못한 오류: ${e && e.stack ? e.stack : e}`);
  process.exit(1);
});
