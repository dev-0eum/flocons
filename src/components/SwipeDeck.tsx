import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

export interface SwipeDeckProps {
  /** 현재 카드 (보통 WordCard). */
  children: ReactNode;
  /** 좌로 스와이프 = 알고 있어요. */
  onSwipeLeft: () => void;
  /** 우로 스와이프 = 학습할게요. */
  onSwipeRight: () => void;
}

/**
 * 단어 카드를 좌/우로 스와이프해 분류하는 덱 (Reanimated 4 + Gesture Handler).
 * 분류 로직은 콜백으로 위임(상태는 부모의 deck reducer).
 */
export function SwipeDeck({ children, onSwipeLeft, onSwipeRight }: SwipeDeckProps) {
  const { width } = useWindowDimensions();
  const translateX = useSharedValue(0);
  const threshold = width * 0.28;

  const finish = (dir: 'left' | 'right') => {
    if (dir === 'left') onSwipeLeft();
    else onSwipeRight();
    translateX.value = 0; // 다음 카드는 중앙에서 시작
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (e.translationX < -threshold) {
        translateX.value = withSpring(-width * 1.5, undefined, (finished) => {
          if (finished) runOnJS(finish)('left');
        });
      } else if (e.translationX > threshold) {
        translateX.value = withSpring(width * 1.5, undefined, (finished) => {
          if (finished) runOnJS(finish)('right');
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${(translateX.value / width) * 12}deg` },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, animatedStyle]}>{children}</Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1 },
});
