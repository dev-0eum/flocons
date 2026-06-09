import { fireEvent, render } from '@testing-library/react-native';

import { StateView } from '@/components/StateView';

describe('StateView', () => {
  it('renders default messages per variant', () => {
    expect(render(<StateView variant="empty" />).getByText('표시할 카드가 없어요.')).toBeTruthy();
    expect(render(<StateView variant="done" />).getByText(/마쳤어요/)).toBeTruthy();
    expect(render(<StateView variant="error" />).getByText('문제가 발생했어요.')).toBeTruthy();
  });

  it('renders a custom message and action', () => {
    const onAction = jest.fn();
    const { getByText, getByLabelText } = render(
      <StateView variant="error" message="네트워크 오류" actionLabel="다시 시도" onAction={onAction} />,
    );
    expect(getByText('네트워크 오류')).toBeTruthy();
    fireEvent.press(getByLabelText('다시 시도'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renders loading variant without crashing', () => {
    expect(render(<StateView variant="loading" />).getByText('불러오는 중…')).toBeTruthy();
  });
});
