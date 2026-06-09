import { fireEvent, render } from '@testing-library/react-native';

import { ActionButtons } from '@/components/ActionButtons';

describe('ActionButtons', () => {
  it('renders both labels', () => {
    const { getByText } = render(<ActionButtons />);
    expect(getByText('알고 있어요')).toBeTruthy();
    expect(getByText('학습할게요')).toBeTruthy();
  });

  it('fires onKnow and onLearn', () => {
    const onKnow = jest.fn();
    const onLearn = jest.fn();
    const { getByLabelText } = render(<ActionButtons onKnow={onKnow} onLearn={onLearn} />);
    fireEvent.press(getByLabelText('알고 있어요'));
    fireEvent.press(getByLabelText('학습할게요'));
    expect(onKnow).toHaveBeenCalledTimes(1);
    expect(onLearn).toHaveBeenCalledTimes(1);
  });
});
