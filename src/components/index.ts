export { WordCard } from './WordCard';
export type { WordCardData, WordCardProps, Pos } from './WordCard';
export { TopBar } from './TopBar';
export type { TopBarProps } from './TopBar';
export { ActionButtons } from './ActionButtons';
export type { ActionButtonsProps } from './ActionButtons';
export { ProgressBar } from './ProgressBar';
export type { ProgressBarProps } from './ProgressBar';
export { StateView } from './StateView';
export type { StateViewProps, StateVariant } from './StateView';

// 참고: `Placeholder`(UoW-00 스캐폴드 잔재)는 디자인 시스템 컴포넌트가 아니므로 배럴에서 제외.
// app/ 화면들은 `@/components/Placeholder`를 직접 import하며, 후속 Unit에서 실제 컴포넌트로 대체된다.
