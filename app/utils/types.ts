export type CutConfig = {
    startX: number;
    startY: number;
    width: number;
    height: number;
    gapX: number;
    gapY: number;
    textStart: number;
    textHeight: number;
}


export const DEFAULT_CUT_CONFIG: CutConfig = {
    startX: 0.101,
    startY: 0.085,
    width: 0.139,
    height: 0.135,
    gapX: 0.028,
    gapY: 0.065,
    textStart: 0.1,
    textHeight: 0.3,
}

export type Rect = { x: number; y: number; width: number; height: number }

export type CutRects = {
    images: Rect[];
    texts: Rect[];
}