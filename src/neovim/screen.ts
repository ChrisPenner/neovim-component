import Store from './store';
import Dispatcher from './dispatcher';
import * as A from './actions';
import log from '../log';

export default class NeovimScreen {
    ctx: CanvasRenderingContext2D;

    constructor(public canvas: HTMLCanvasElement) {
        this.ctx = this.canvas.getContext('2d');

        Store.on('put', this.drawText.bind(this));
        Store.on('clear-all', this.clearAll.bind(this));
        Store.on('clear-eol', this.clearEol.bind(this));
        // Note: 'update-bg' clears all texts in screen.
        Store.on('update-bg', this.clearAll.bind(this));
        Store.on('screen-scrolled', this.scroll.bind(this));

        // TODO:
        // Watch 'resize' event from neovim

        this.updateActualFontSize(Store.font_attr.specified_px);

        canvas.addEventListener('click', this.focus.bind(this));
        canvas.addEventListener('mousedown', this.mouseDown.bind(this));
        canvas.addEventListener('mouseup', this.mouseUp.bind(this));
        canvas.addEventListener('mousemove', this.mouseMove.bind(this));
        canvas.addEventListener('wheel', this.wheel.bind(this));
    }

    wheel(e: WheelEvent) {
        Dispatcher.dispatch(A.wheelScroll(e));
    }

    mouseDown(e: MouseEvent) {
        Dispatcher.dispatch(A.dragStart(e));
    }

    mouseUp(e: MouseEvent) {
        Dispatcher.dispatch(A.dragEnd(e));
    }

    mouseMove(e: MouseEvent) {
        if (e.buttons !== 0) {
            Dispatcher.dispatch(A.dragUpdate(e));
        }
    }

    resizeScreen(width: number, height: number) {
        this.resizeImpl(
                Math.floor(height / Store.font_attr.height),
                Math.floor(width / Store.font_attr.width),
                width,
                height
            );
    }

    resizeView(lines: number, cols: number) {
        this.resizeImpl(
                lines,
                cols,
                Store.font_attr.width * cols,
                Store.font_attr.height * lines
            );
    }

    updateActualFontSize(specified_px: number) {
        this.ctx.font = specified_px + 'px ' + Store.font_attr.face;
        const font_width = this.ctx.measureText('m').width;
        const font_height = font_width * 2;
        Dispatcher.dispatch(A.updateFontPx(specified_px));
        Dispatcher.dispatch(A.updateFontSize(font_width, font_height));
        this.resizeScreen(Store.size.width, Store.size.height);
    }

    // Note:
    //  cols_delta > 0 -> screen up
    //  cols_delta < 0 -> screen down
    scroll(cols_delta: number) {
        if (cols_delta > 0) {
            this.scrollUp(cols_delta);
        } else if (cols_delta < 0){
            this.scrollDown(-cols_delta);
        }
    }

    focus() {
        Dispatcher.dispatch(A.focus());
    }

    clearAll() {
        this.ctx.fillStyle = Store.font_attr.bg;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    clearEol() {
        const {line, col} = Store.cursor;
        const font_width = Store.font_attr.width;
        const clear_length = Store.size.cols * font_width - col * font_width;
        log.debug(`Clear until EOL: ${line}:${col} length=${clear_length}`);
        this.drawBlock(line, col, 1, clear_length, Store.font_attr.bg);
    }

    private drawText(chars: string[][]) {
        const {line, col} = Store.cursor;
        const {fg, bg, width, height, face, specified_px} = Store.font_attr;

        // Draw background
        this.drawBlock(line, col, 1, chars.length, bg);

        // TODO: Consider font attributes (e.g. underline, bold, ...)
        this.ctx.font = specified_px + 'px ' + face;
        this.ctx.textBaseline = 'top';
        this.ctx.fillStyle = fg;
        const text = chars.map(c => (c[0] || '')).join('');
        const x = col * width;
        const y = line * height;
        this.ctx.fillText(text, x, y);
        log.debug(`drawText(): (${x}, ${y})`, text, Store.cursor);
    }

    private drawBlock(line: number, col: number, height: number, width: number, color: string) {
        const font = Store.font_attr;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(
                Math.floor(col * font.width),
                Math.floor(line * font.height),
                Math.ceil(width * font.width),
                Math.ceil(height * font.height)
            );
    }

    private scrollUp(cols_up: number) {
        const {top, bottom, left, right} = Store.scroll_region;
        const font = Store.font_attr;
        const captured
            = this.ctx.getImageData(
                left * font.width,
                (top + cols_up) * font.height,
                (right - left + 1) * font.width,
                (bottom - top + cols_up - 1) * font.height // Specify just before the bottom line
            );
        this.ctx.putImageData(
            captured,
            left * font.width,
            top * font.height
        );
        this.drawBlock(
            bottom - cols_up + 1,
            left,
            cols_up,
            right - left + 1,
            font.bg
        );
        log.debug('Scroll up: ' + cols_up, Store.scroll_region);
    }

    private scrollDown(cols_down: number) {
        const {top, bottom, left, right} = Store.scroll_region;
        const font = Store.font_attr;
        const captured
            = this.ctx.getImageData(
                left * font.width,
                top * font.height,
                (right - left + 1) * font.width,
                (bottom - top - cols_down) * font.height
            );
        this.ctx.putImageData(
            captured,
            left * font.width,
            (top + cols_down) * font.height
        );
        this.drawBlock(
            top,
            left,
            cols_down - 1, // Specify just before the bottom line
            right - left + 1,
            font.bg
        );
        log.debug('Scroll down: ' + cols_down, Store.scroll_region);
    }

    private resizeImpl(lines: number, cols: number, width: number, height: number) {
        if (width !== this.canvas.width) {
            this.canvas.width = width;
        }
        if (height !== this.canvas.height) {
            this.canvas.height = height;
        }
        Dispatcher.dispatch(A.updateScreenSize(width, height));
        Dispatcher.dispatch(A.updateScreenBounds(lines, cols));
    }
}

