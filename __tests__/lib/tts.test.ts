import * as Speech from 'expo-speech';

import { speak, stop } from '@/lib/tts';

describe('tts (expo-speech wrapper)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('speaks text in fr-FR', () => {
    speak('le crime');
    expect(Speech.speak).toHaveBeenCalledWith(
      'le crime',
      expect.objectContaining({ language: 'fr-FR' }),
    );
  });

  it('forwards rate and voice options', () => {
    speak('bonjour', { rate: 0.8, voice: 'fr-1' });
    expect(Speech.speak).toHaveBeenCalledWith(
      'bonjour',
      expect.objectContaining({ language: 'fr-FR', rate: 0.8, voice: 'fr-1' }),
    );
  });

  it('stop() stops speech', () => {
    stop();
    expect(Speech.stop).toHaveBeenCalledTimes(1);
  });
});
