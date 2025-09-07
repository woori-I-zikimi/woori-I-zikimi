// types.ts

export type ID = string;

export interface Comment {
  id: ID;
  text: string;
  author: string;
  /** 권장: 새 코드에서 사용 */
  createdAt: Date;
  /** 하위호환: 기존 컴포넌트에서 참조 중이면 일단 유지 */
  timestamp?: Date;
}

export interface Question {
  id: ID;
  text: string;
  /** 선택: parseQuestionText 결과를 저장하고 싶으면 사용 */
  title?: string;
  body?: string;

  color: string;

  /** 위치/레이아웃(옵셔널: 없으면 캔버스에서 기본값 계산) */
  x?: number;
  y?: number;

  /** 물리/애니메이션(옵셔널) */
  vx?: number;
  vy?: number;
  radius?: number;
  mass?: number;

  comments: Comment[];

  /** 권장: 새 코드에서 사용 */
  createdAt: Date;
  /** 하위호환: 기존 컴포넌트에서 참조 중이면 일단 유지 */
  timestamp?: Date;
  acceptedCommentId?: string | null;
}
