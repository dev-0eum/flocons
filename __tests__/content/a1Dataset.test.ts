import a1 from '@/data/a1.json';
import { validateWords } from '@/content/validateWords';

describe('A1 seed dataset (src/data/a1.json)', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(a1)).toBe(true);
    expect(a1.length).toBeGreaterThan(0);
  });

  it('passes validateWords with no errors', () => {
    const { errors } = validateWords(a1);
    // 실패 시 어떤 항목인지 보이도록 errors를 노출
    expect(errors).toEqual([]);
  });

  it('all entries are level A1 with unique ids', () => {
    const ids = new Set<string>();
    for (const w of a1 as { id: string; level: string }[]) {
      expect(w.level).toBe('A1');
      expect(ids.has(w.id)).toBe(false);
      ids.add(w.id);
    }
  });

  it('preserves the frozen A1 id set (UoW-12 DoD — CardState/캐시가 id 참조)', () => {
    // 이 목록은 의도적으로 고정한다. A1 id를 바꾸면 사용자의 학습 상태가 끊긴다.
    const FROZEN_A1_IDS = [
      'fr-a1-bonjour', 'fr-a1-bonsoir', 'fr-a1-merci', 'fr-a1-s-il-vous-plait', 'fr-a1-oui',
      'fr-a1-non', 'fr-a1-un', 'fr-a1-deux', 'fr-a1-trois', 'fr-a1-cinq',
      'fr-a1-dix', 'fr-a1-lundi', 'fr-a1-vendredi', 'fr-a1-heure', 'fr-a1-jour',
      'fr-a1-matin', 'fr-a1-famille', 'fr-a1-mere', 'fr-a1-pere', 'fr-a1-frere',
      'fr-a1-soeur', 'fr-a1-ami', 'fr-a1-eau', 'fr-a1-cafe', 'fr-a1-pain',
      'fr-a1-lait', 'fr-a1-pomme', 'fr-a1-rouge', 'fr-a1-bleu', 'fr-a1-blanc',
      'fr-a1-noir', 'fr-a1-vert', 'fr-a1-tete', 'fr-a1-main', 'fr-a1-oeil',
      'fr-a1-bouche', 'fr-a1-maison', 'fr-a1-table', 'fr-a1-chaise', 'fr-a1-livre',
      'fr-a1-stylo', 'fr-a1-etre', 'fr-a1-avoir', 'fr-a1-aller', 'fr-a1-parler',
      'fr-a1-manger', 'fr-a1-boire', 'fr-a1-aimer', 'fr-a1-habiter', 'fr-a1-vouloir',
      'fr-a1-pouvoir', 'fr-a1-grand', 'fr-a1-petit', 'fr-a1-bon', 'fr-a1-beau',
      'fr-a1-nouveau', 'fr-a1-je', 'fr-a1-vous', 'fr-a1-et', 'fr-a1-mais',
      'fr-a1-dans', 'fr-a1-sur', 'fr-a1-avec', 'fr-a1-tres', 'fr-a1-au-revoir',
    ];
    expect((a1 as { id: string }[]).map((w) => w.id)).toEqual(FROZEN_A1_IDS);
  });
});
