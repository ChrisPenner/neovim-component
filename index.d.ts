import { EventEmitter } from 'events';
import { Nvim } from 'promised-neovim-client';
import { Dispatcher } from 'flux';
import cp = require('child_process');
import NvimClient = require('promised-neovim-client');
export declare type RPCValue = NvimClient.Buffer | NvimClient.Window | NvimClient.Tabpage | number | boolean | string | any[] | {
    [key: string]: any;
};

export interface HighlightSet {
    background?: number;
    bg?: string;
    bold?: boolean;
    fg?: string;
    foreground?: number;
    italic?: boolean;
    reverse?: boolean;
    undercurl?: boolean;
    underline?: boolean;
}
export interface Region {
    top: number;
    left: number;
    right: number;
    bottom: number;
}
export declare enum Kind {
    Bell = 0,
    BusyStart = 1,
    BusyStop = 2,
    ClearAll = 3,
    ClearEOL = 4,
    Cursor = 5,
    DisableMouse = 6,
    DragEnd = 7,
    DragStart = 8,
    DragUpdate = 9,
    EnableMouse = 10,
    Focus = 11,
    Highlight = 12,
    Input = 13,
    Mode = 14,
    PutText = 15,
    Resize = 16,
    ScrollScreen = 17,
    SetIcon = 18,
    SetScrollRegion = 19,
    SetTitle = 20,
    UpdateBG = 21,
    UpdateFG = 22,
    UpdateFontFace = 23,
    UpdateFontPx = 24,
    UpdateFontSize = 25,
    UpdateScreenBounds = 26,
    UpdateScreenSize = 27,
    WheelScroll = 28,
}
export interface ActionType {
    type: Kind;
    col?: number;
    color?: number;
    cols?: number;
    event?: MouseEvent | WheelEvent;
    font_face?: string;
    font_px?: number;
    height?: number;
    highlight?: HighlightSet;
    icon_path?: string;
    input?: string;
    line?: number;
    lines?: number;
    mode?: string;
    region?: Region;
    text?: string[][];
    title?: string;
    visual?: boolean;
    width?: number;
}
export declare function putText(text: string[][]): {
    type: Kind;
    text: string[][];
};
export declare function cursor(line: number, col: number): {
    type: Kind;
    line: number;
    col: number;
};
export declare function highlight(highlight: HighlightSet): {
    type: Kind;
    highlight: HighlightSet;
};
export declare function clearAll(): {
    type: Kind;
};
export declare function clearEndOfLine(): {
    type: Kind;
};
export declare function resize(lines: number, cols: number): {
    type: Kind;
    lines: number;
    cols: number;
};
export declare function updateForeground(color: number): {
    type: Kind;
    color: number;
};
export declare function updateBackground(color: number): {
    type: Kind;
    color: number;
};
export declare function changeMode(mode: string): {
    type: Kind;
    mode: string;
};
export declare function startBusy(): {
    type: Kind;
};
export declare function stopBusy(): {
    type: Kind;
};
export declare function updateFontSize(width: number, height: number): {
    type: Kind;
    width: number;
    height: number;
};
export declare function inputToNeovim(input: string): {
    type: Kind;
    input: string;
};
export declare function focus(): {
    type: Kind;
};
export declare function updateFontPx(font_px: number): {
    type: Kind;
    font_px: number;
};
export declare function updateFontFace(font_face: string): {
    type: Kind;
    font_face: string;
};
export declare function updateScreenSize(width: number, height: number): {
    type: Kind;
    width: number;
    height: number;
};
export declare function updateScreenBounds(lines: number, cols: number): {
    type: Kind;
    lines: number;
    cols: number;
};
export declare function enableMouse(): {
    type: Kind;
};
export declare function disableMouse(): {
    type: Kind;
};
export declare function dragStart(event: MouseEvent): {
    type: Kind;
    event: MouseEvent;
};
export declare function dragUpdate(event: MouseEvent): {
    type: Kind;
    event: MouseEvent;
};
export declare function dragEnd(event: MouseEvent): {
    type: Kind;
    event: MouseEvent;
};
export declare function bell(visual: boolean): {
    type: Kind;
    visual: boolean;
};
export declare function setTitle(title: string): {
    type: Kind;
    title: string;
};
export declare function setIcon(icon_path: string): {
    type: Kind;
    icon_path: string;
};
export declare function wheelScroll(event: WheelEvent): {
    type: Kind;
    event: WheelEvent;
};
export declare function scrollScreen(cols: number): {
    type: Kind;
    cols: number;
};
export declare function setScrollRegion(region: Region): {
    type: Kind;
    region: Region;
};

export class NeovimCursor {
    private store;
    element: HTMLDivElement;
    constructor(store: NeovimStore);
    updateSize(): void;
    updateColor(): void;
    onModeChanged(): void;
    updateCursorPos(): void;
}

export class NeovimInput {
    private store;
    element: HTMLInputElement;
    ime_running: boolean;
    static shouldHandleModifier(event: KeyboardEvent): boolean;
    static getVimSpecialChar(code: number, shift: boolean): string;
    constructor(store: NeovimStore);
    startComposition(event: Event): void;
    endComposition(event: Event): void;
    focus(): void;
    onInsertControlChar(event: KeyboardEvent): void;
    inputToNeovim(input: string, event: Event): void;
    onInsertNormalChar(event: KeyboardEvent): void;
}

export class NeovimProcess {
    private store;
    command: string;
    argv: string[];
    neovim_process: cp.ChildProcess;
    client: NvimClient.Nvim;
    started: boolean;
    constructor(store: NeovimStore, command: string, argv: string[]);
    attach(lines: number, columns: number): Promise<void>;
    onRequested(method: string, args: RPCValue[], response: RPCValue): void;
    onNotified(method: string, args: RPCValue[]): void;
    onDisconnected(): void;
    finalize(): void;
    private redraw(events);
}

export class ScreenDrag {
    private store;
    line: number;
    col: number;
    static buildInputOf(e: MouseEvent, type: string, line: number, col: number): string;
    constructor(store: NeovimStore);
    start(down_event: MouseEvent): string;
    drag(move_event: MouseEvent): string;
    end(up_event: MouseEvent): string;
    private getPos(e);
}

export class ScreenWheel {
    private store;
    x: number;
    y: number;
    shift: boolean;
    ctrl: boolean;
    constructor(store: NeovimStore);
    handleEvent(e: WheelEvent): string;
    private reset();
    private getDirection(scroll_x, scroll_y);
    private getInput(scroll_x, scroll_y);
}

export class NeovimScreen {
    private store;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    cursor: NeovimCursor;
    input: NeovimInput;
    constructor(store: NeovimStore, canvas: HTMLCanvasElement);
    wheel(e: WheelEvent): void;
    mouseDown(e: MouseEvent): void;
    mouseUp(e: MouseEvent): void;
    mouseMove(e: MouseEvent): void;
    resizeWithPixels(width_px: number, height_px: number): void;
    resize(lines: number, cols: number): void;
    changeFontSize(specified_px: number): void;
    scroll(cols_delta: number): void;
    focus(): void;
    clearAll(): void;
    clearEol(): void;
    convertPositionToLocation(line: number, col: number): {
        x: number;
        y: number;
    };
    convertLocationToPosition(x: number, y: number): {
        line: number;
        col: number;
    };
    private drawText(chars);
    private drawBlock(line, col, height, width, color);
    private slideVertical(top, height, dst_top);
    private scrollUp(cols_up);
    private scrollDown(cols_down);
    private resizeImpl(lines, cols, width, height);
}

export interface Size {
    lines: number;
    cols: number;
    width: number;
    height: number;
}
export interface Cursor {
    line: number;
    col: number;
}
export interface FontAttributes {
    fg: string;
    bg: string;
    bold: boolean;
    italic: boolean;
    reverse: boolean;
    underline: boolean;
    undercurl: boolean;
    width: number;
    height: number;
    face: string;
    specified_px: number;
}
export declare type DispatcherType = Dispatcher<ActionType>;
export class NeovimStore extends EventEmitter {
    dispatch_token: string;
    size: Size;
    font_attr: FontAttributes;
    fg_color: string;
    bg_color: string;
    cursor: Cursor;
    mode: string;
    busy: boolean;
    mouse_enabled: boolean;
    dragging: ScreenDrag;
    title: string;
    icon_path: string;
    wheel_scrolling: ScreenWheel;
    scroll_region: Region;
    dispatcher: Dispatcher<ActionType>;
    constructor();
    private receiveAction(action);
}

export class Neovim extends EventEmitter {
    process: NeovimProcess;
    screen: NeovimScreen;
    store: NeovimStore;
    constructor(command: string, argv: string[], font: string, font_size: number, width: number, height: number);
    attachCanvas(canvas: HTMLCanvasElement): void;
    quit(): void;
    getClient(): Nvim;
    focus(): void;
    setArgv(argv: string[]): Promise<void>;
}
