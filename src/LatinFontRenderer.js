'use strict';

const FontRenderer = require('./FontRenderer.js');

class LatinFontRenderer extends FontRenderer {
    constructor(font, headersz, width, height) {
        super(width, height);

        this._fontbin = font.slice(headersz, font.length);
        this._fonts = [];

        for (let i = 0; i < 0xFF; i++) {
            this._fonts[i] = this._grabChar(i);
        }
    }

    _grabChar(off) {
        const {height} = this.getDimension();
        const byteWidth = this.getByteWidth();
        const characterByte = byteWidth * height;

        return this._fontbin.slice(characterByte * off, characterByte * (off + 1));
    }

    renderChar(code) {
        const {height} = this.getDimension();
        const byteWidth = this.getByteWidth();
        const characterByte = byteWidth * height;

        const buf = Buffer.alloc(32);

        const rowStep = byteWidth === 2 ? 1 : 2;
        for (let i = 0; i < characterByte; i++) {
            buf[i * rowStep] |= this._fonts[code][i];
        }

        return buf;
    }
}

module.exports = LatinFontRenderer;
