import Neovim from './neovim';

Polymer({
    is: 'neovim-editor',

    properties: {
        width: {
            type: Number,
            value: 800,
        },
        height: {
            type: Number,
            value: 600,
        },
        fontSize: {
            type: Number,
            value: 12,
        },
        font: {
            type: String,
            value: 'monospace',
        },
        nvimCmd: {
            type: String,
            value: 'nvim',
        },
        argv: {
            type: Array,
            value: () => [] as string[],
        },
        neovim: Object,
    },

    ready: function() {
        this.app = new Neovim(this.nvimCmd, this.argv, this.font, this.fontSize);
    },

    attached: function() {
        const canvas = document.querySelector('.neovim-canvas') as HTMLCanvasElement;
        this.app.attachDOM(canvas);
    },
});
