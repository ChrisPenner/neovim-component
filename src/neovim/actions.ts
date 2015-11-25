export interface HighlightSet {
    fg?: string;
    bg?: string;
    bold?: boolean;
    italic?: boolean;
    reverse?: boolean;
    underline?: boolean;
    undercurl?: boolean;
    foreground?: number;
    background?: number;
}

export enum Kind {
    PutText,
    Cursor,
    Highlight,
    ClearAll,
    ClearEOL,
    Resize,
    UpdateFG,
    UpdateBG,
    Mode,
    BusyStart,
    BusyStop,
    UpdateFontSize,
    Input,
    Focus,
    UpdateFontPx,
    UpdateFontFace,
};

export interface ActionType {
    type: Kind;
    text?: string[][];
    line?: number;
    col?: number;
    lines?: number;
    cols?: number;
    color?: number;
    mode?: string;
    highlight?: HighlightSet;
    width?: number;
    height?: number;
    input?: string;
    font_px?: number;
    font_face?: string;
}

export function putText(text: string[][]) {
    return {
        type: Kind.PutText,
        text,
    };
}

export function cursor(line: number, col: number) {
    return {
        type: Kind.Cursor,
        line, col,
    };
}

export function highlight(highlight: HighlightSet) {
    return {
        type: Kind.Highlight,
        highlight,
    };
}

export function clearAll() {
    return {
        type: Kind.ClearAll,
    };
}

export function clearEndOfLine() {
    return {
        type: Kind.ClearEOL,
    };
}

export function resize(lines: number, cols: number) {
    return {
        type: Kind.Resize,
        lines, cols,
    };
}

export function updateForeground(color: number) {
    return {
        type: Kind.UpdateFG,
        color,
    };
}

export function updateBackground(color: number) {
    return {
        type: Kind.UpdateBG,
        color,
    };
}

export function changeMode(mode: string) {
    return {
        type: Kind.Mode,
        mode,
    };
}

export function startBusy() {
    return {
        type: Kind.BusyStart,
    };
}

export function stopBusy() {
    return {
        type: Kind.BusyStop,
    };
}

export function updateFontSize(width: number, height: number) {
    return {
        type: Kind.UpdateFontSize,
        width, height,
    };
}

export function inputToNeovim(input: string) {
    return {
        type: Kind.Input,
        input,
    };
}

export function focus() {
    return {
        type: Kind.Focus,
    };
}

export function updateFontPx(font_px: number) {
    return {
        type: Kind.UpdateFontPx,
        font_px,
    };
}

export function updateFontFace(font_face: string) {
    return {
        type: Kind.UpdateFontFace,
        font_face,
    };
}
