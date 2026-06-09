import { fireEvent, render } from '@testing-library/react-native';

import { TopBar } from '@/components/TopBar';

describe('TopBar', () => {
  it('shows progress and excluded count', () => {
    const { getByLabelText } = render(
      <TopBar excludedCount={16} progressCurrent={10} progressTotal={46} />,
    );
    expect(getByLabelText('진행 10 / 46')).toBeTruthy();
    expect(getByLabelText('제외 16개')).toBeTruthy();
  });

  it('fires undo and menu callbacks', () => {
    const onUndo = jest.fn();
    const onMenu = jest.fn();
    const { getByLabelText } = render(
      <TopBar
        excludedCount={0}
        progressCurrent={1}
        progressTotal={5}
        onUndo={onUndo}
        onMenu={onMenu}
      />,
    );
    fireEvent.press(getByLabelText('되돌리기'));
    fireEvent.press(getByLabelText('메뉴'));
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onMenu).toHaveBeenCalledTimes(1);
  });
});
