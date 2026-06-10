import { render } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';

import { Placeholder } from '@/components/Placeholder';

describe('UoW-00 scaffold smoke', () => {
  it('renders the Placeholder presentational component', () => {
    const { getByText } = render(<Placeholder title="flocons" subtitle="hello" />);
    expect(getByText('flocons')).toBeTruthy();
    expect(getByText('hello')).toBeTruthy();
  });

  it('native module (expo-secure-store) is mocked in jest (UoW-08: in-memory 라운드트립)', async () => {
    await SecureStore.setItemAsync('k', 'v');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('k', 'v');
    await expect(SecureStore.getItemAsync('k')).resolves.toBe('v');
    await SecureStore.deleteItemAsync('k');
    await expect(SecureStore.getItemAsync('k')).resolves.toBeNull();
  });
});
