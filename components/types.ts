// types.ts

export type ID = string;

export interface Comment {
    id: ID; // 댓글 고유 식별자
    text: string; // 댓글 본문
    author: string; // 댓글 작성자 (여기서는 "익명" 등)
    createdAt: Date; // 댓글 작성 시각 (권장: 앞으로는 이걸 쓰자)
    timestamp?: Date; // 예전 코드에서 쓰던 필드 → 하위호환용으로 남겨둔 옵션
}

export interface Question {
    id: string;
    title: string; // 제목
    content: string; // 내용
    color: string;
    createdAt: Date | null;
    commentsCount: number;

    // UI/물리값(옵셔널)
    x?: number;
    y?: number;
    vx?: number;
    vy?: number;
    radius?: number;
    mass?: number;

    comments: Comment[];

    // 하위호환: 옛 문서가 text만 있을 수 있어 남겨둠(읽기용 보정에서 사용)
    text?: string;
    timestamp?: Date;
    acceptedCommentId?: string | null;
}

// 버블 렌더 전용 파생 타입 (물리값만 추가)
export type RenderQuestion = Question & {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    mass: number;
};
