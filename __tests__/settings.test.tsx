import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Alert, type AlertButton } from 'react-native';

import { deleteKey, getKey } from '@/lib/secureKeys';
import { classifyCard, getCard, resetCards } from '@/store/cardStore';
import { getSettings, resetSettingsForTest } from '@/store/settingsStore';
import { getStudyDays, recordStudyDay, resetStudyLog } from '@/store/studyLog';
import SettingsScreen from '../app/settings';

beforeEach(async () => {
  resetSettingsForTest();
  resetCards();
  resetStudyLog();
  await deleteKey('anthropic');
  await deleteKey('image');
});

describe('SettingsScreen — TTS 속도 / 레벨', () => {
  it('발음 속도 프리셋 선택이 settingsStore에 반영된다', () => {
    const { getByLabelText } = render(<SettingsScreen />);
    fireEvent.press(getByLabelText('발음 속도 빠르게'));
    expect(getSettings().ttsRate).toBe(1.25);
  });

  it('레벨 선택이 반영된다 (화면 연동은 UoW-11)', () => {
    const { getByLabelText } = render(<SettingsScreen />);
    fireEvent.press(getByLabelText('레벨 A2'));
    expect(getSettings().level).toBe('A2');
  });
});

describe('SettingsScreen — API 키 (ADR-004)', () => {
  it('저장 → secure-store 저장·배지 갱신·입력칸 클리어·평문 미노출', async () => {
    const { getByLabelText, findByText, queryByText } = render(<SettingsScreen />);
    const input = getByLabelText('Anthropic 키 입력');

    fireEvent.changeText(input, 'sk-secret-123');
    fireEvent.press(getByLabelText('Anthropic 키 저장'));

    expect(await findByText('저장됨')).toBeTruthy(); // hasKey 배지
    expect(await getKey('anthropic')).toBe('sk-secret-123'); // secure-store에만
    expect(input.props.value).toBe(''); // 저장 즉시 클리어
    expect(queryByText('sk-secret-123')).toBeNull(); // 화면에 평문 없음
  });

  it('삭제 → hasKey false 회귀 (Provider Static 회귀 전제)', async () => {
    const { getByLabelText, findByLabelText } = render(<SettingsScreen />);
    fireEvent.changeText(getByLabelText('Anthropic 키 입력'), 'sk-temp');
    fireEvent.press(getByLabelText('Anthropic 키 저장'));
    await waitFor(() => expect(getSettings().hasAnthropicKey).toBe(true));

    fireEvent.press(await findByLabelText('Anthropic 키 삭제'));
    await waitFor(() => expect(getSettings().hasAnthropicKey).toBe(false));
    expect(await getKey('anthropic')).toBeNull();
  });

  it('빈 입력은 저장하지 않는다', async () => {
    const { getByLabelText } = render(<SettingsScreen />);
    fireEvent.press(getByLabelText('Anthropic 키 저장'));
    await waitFor(() => expect(getSettings().hasAnthropicKey).toBe(false));
    expect(await getKey('anthropic')).toBeNull();
  });
});

describe('SettingsScreen — 데이터 초기화 (Q-I4)', () => {
  it('확인 시 cards·studyLog만 초기화하고 키는 유지한다', async () => {
    const alertSpy = jest
      .spyOn(Alert, 'alert')
      .mockImplementation((_title, _message, buttons?: AlertButton[]) => {
        buttons?.find((b) => b.text === '초기화')?.onPress?.();
      });

    classifyCard('w1', 'known', 1000);
    recordStudyDay(1000);
    const { getByLabelText, findByText } = render(<SettingsScreen />);

    // 키 저장 후 초기화해도 키가 살아있는지 확인
    fireEvent.changeText(getByLabelText('Anthropic 키 입력'), 'sk-keep');
    fireEvent.press(getByLabelText('Anthropic 키 저장'));
    await findByText('저장됨');

    fireEvent.press(getByLabelText('데이터 초기화'));

    expect(getCard('w1')).toBeUndefined(); // SRS 초기화
    expect(getStudyDays().size).toBe(0); // 학습일 초기화
    expect(await getKey('anthropic')).toBe('sk-keep'); // 키 유지 (Q4)

    alertSpy.mockRestore();
  });
});
