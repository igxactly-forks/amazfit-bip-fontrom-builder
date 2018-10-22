'use strict';
/* eslint no-sync: 0 */
/* eslint no-process-exit: 0 */

const fs = require('fs');
const BipFont = require('./src/BipFont.js');
const Dkb844FontRenderer = require('./src/Dkb844FontRenderer.js');
const LatinFontRenderer = require('./src/LatinFontRenderer.js');
const FontXFontRenderer = require('./src/FontXFontRenderer.js');
//const BitmapFontStorage = require('./src/BitmapFontStorage.js');
const FontVisualizer = require('./src/FontVisualizer.js');

function renderAndAddGlyph(bfs, renderer, start, end) {
    for (let i = start; i <= end; i++) {
        try {
            const bin = renderer.renderChar(i);
            bfs.addGlyph(i, bin, 4, renderer.getDimension().width);
        } catch (e) {}
    }
}

async function main() {
    //const ftfile = fs.readFileSync('./test-latinonly.ft');
    const ftfile = fs.readFileSync('./asset/vendor/Mili_chaohu.ft');
    const dkbfile = fs.readFileSync('./asset/dkb844/H04.FNT');
    const latinFile = fs.readFileSync('./asset/latin/VGA-ROM.F16');
    const fontxFile = fs.readFileSync('./asset/fontx/04GZN16X.FNT');

    //const fontmap = BipFont.unpackFile(ftfile);
    //const fontbin = BipFont.packFile(fontmap);
    //fs.writeFileSync('./test.ft', fontbin);
    //return;

    const dkb = new Dkb844FontRenderer(dkbfile, 16, 16);
    const dkbimg = dkb.renderChar('삠'.codePointAt(0));
    FontVisualizer.drawToConsole(dkbimg);

    const latin = new LatinFontRenderer(latinFile, 8, 16);
    const latinimg = latin.renderChar('I'.codePointAt(0));
    FontVisualizer.drawToConsole(latinimg);

    const fontx = new FontXFontRenderer(fontxFile);
    const fontximg = fontx.renderChar('い'.codePointAt(0));
    FontVisualizer.drawToConsole(fontximg);

    const bfs = BipFont.unpackFile(ftfile);

    renderAndAddGlyph(bfs, latin, 0x0000, 0x007F);

    renderAndAddGlyph(bfs, dkb, 0x1100, 0x1112);
    renderAndAddGlyph(bfs, dkb, 0x11A8, 0x11C2);
    renderAndAddGlyph(bfs, dkb, 0x3131, 0x314E);
    renderAndAddGlyph(bfs, dkb, 0x314F, 0x3163);
    renderAndAddGlyph(bfs, dkb, 0xAC00, 0xD7A3);

    renderAndAddGlyph(bfs, fontx, 0x3040, 0x309F);
    renderAndAddGlyph(bfs, fontx, 0x30A0, 0x30FF);
    renderAndAddGlyph(bfs, fontx, 0x4E00, 0x9FFF);
    renderAndAddGlyph(bfs, fontx, 0x3400, 0x4DBF);

    const bin = BipFont.packFile(bfs);
    fs.writeFileSync('./built.ft', bin);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
