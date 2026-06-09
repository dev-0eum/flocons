import { render } from '@testing-library/react-native';

import { ProgressBar } from '@/components/ProgressBar';

describe('ProgressBar', () => {
  it('exposes progressbar role and value', () => {
    const { getByRole } = render(<ProgressBar current={3} total={10} />);
    const bar = getByRole('progressbar');
    expect(bar).toBeTruthy();
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 10, now: 3 });
  });

  it('does not crash when total is 0', () => {
    const { getByRole } = render(<ProgressBar current={0} total={0} />);
    expect(getByRole('progressbar')).toBeTruthy();
  });
});
