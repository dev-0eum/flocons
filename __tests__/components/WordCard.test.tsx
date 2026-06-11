import { fireEvent, render } from '@testing-library/react-native';

import { WordCard, type WordCardData } from '@/components/WordCard';

const data: WordCardData = {
  lemma: 'crime',
  article: 'le',
  gender: 'm',
  pos: 'n',
  krMeaning: '범죄',
  exampleFr: 'La police enquête sur un crime.',
  exampleKr: '경찰이 범죄를 수사한다.',
};

describe('WordCard', () => {
  it('renders meaning and example texts', () => {
    const { getByText, getByLabelText } = render(<WordCard data={data} />);
    expect(getByText('범죄')).toBeTruthy();
    expect(getByText(data.exampleFr)).toBeTruthy();
    expect(getByText(data.exampleKr)).toBeTruthy();
    // 단어는 관사+표제어가 나뉘어 렌더되므로 accessibilityLabel로 확인
    expect(getByLabelText(/le crime/)).toBeTruthy();
  });

  it('fires audio and bookmark callbacks', () => {
    const onPlayWord = jest.fn();
    const onPlayExample = jest.fn();
    const onToggleBookmark = jest.fn();
    const { getByLabelText } = render(
      <WordCard
        data={data}
        onPlayWord={onPlayWord}
        onPlayExample={onPlayExample}
        onToggleBookmark={onToggleBookmark}
      />,
    );
    fireEvent.press(getByLabelText('단어 발음 듣기'));
    fireEvent.press(getByLabelText('예문 발음 듣기'));
    fireEvent.press(getByLabelText('북마크 추가'));
    expect(onPlayWord).toHaveBeenCalledTimes(1);
    expect(onPlayExample).toHaveBeenCalledTimes(1);
    expect(onToggleBookmark).toHaveBeenCalledTimes(1);
  });

  it('reflects bookmarked state in the label', () => {
    const { getByLabelText } = render(<WordCard data={data} bookmarked />);
    expect(getByLabelText('북마크 해제')).toBeTruthy();
  });

  it('renders the deterministic image fallback (initial) when no image (UoW-10)', () => {
    const { getByText } = render(
      <WordCard data={data} imageFallback={{ color: '#FDE2E4', label: 'C' }} />,
    );
    // 플레이스홀더는 장식 요소(accessibilityElementsHidden)라 숨김 포함 조회
    expect(getByText('C', { includeHiddenElements: true })).toBeTruthy();
  });
});
