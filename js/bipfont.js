let exportFlag = false;
try {
    if (module !== undefined) {
        exportFlag = true;
    }
} catch (_e) {
    //
}

'use strict';

function printFont(bin) {
    let line = '';
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 16; j++) {
            const pixelpt = i * 16 + j;
            const buf = bin[Math.floor(pixelpt / 8)];
            const bit = buf << (pixelpt % 8);
            if (bit & 0x80) {
                line = line + '■';
            } else {
                line = line + '□';
            }
        }
        line += '\n';
    }

    console.log(line);
}

class BIPFont {
    static unpackFile(bin) {
        const magic = bin.readUInt32BE(0);
        if (magic !== 0x4E455A4b) {
            throw new Error('Invalid magic');
        }

        const fonts = {};
        const ranges = [];

        const rangesCnt = bin.readUInt16LE(0x20);

        for (let i = 0; i < rangesCnt; i++) {
            const elem = {
                start: bin.readUInt16LE(0x22 + i*6),
                end: bin.readUInt16LE(0x24 + i*6),
                seq: bin.readUInt16LE(0x26 + i*6),
            };

            ranges.push(elem);
        }

        let off = 0x22 + 0x06 * ranges.length;
        for (const elem of ranges) {
            for (let i = elem.start; i <= elem.end; i++) {
                const font = bin.slice(off, off + 32);
                const margin_top = bin[off + 32] & 0x0F;
                const width = bin[off + 32] >> 4;
                off += 33;

                fonts[i] = {
                    data: font,
                    margin_top: margin_top,
                    width: width,
                };
            }
        }

        return fonts;
    }

    static packFile(fontmap) {
        const codepoints = Object.keys(fontmap).sort((a, b) => {
            const an = parseInt(a);
            const bn = parseInt(b);

            return an < bn ? -1 : (an > bn ? 1 : 0);
        }).map((x) => {
            return parseInt(x);
        });

        let header = Buffer.from('4E455A4B08FFFFFFFFFF01000000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF0000', 'hex');
        let body = Buffer.from([]);

        let blkstart = codepoints[0];
        let blkcnt = 0;
        let seqcnt = 0;
        for (let i = 0; i < codepoints.length; i++) {
            const font = fontmap[codepoints[i]];

            if (font.data.length != 32) {
                throw new Error('Invalid font binary');
            }

            const padding = ((font.width << 4) + (font.margin_top & 0x0F)) & 0xFF;
            const fontimg = Buffer.concat([font.data, Buffer.from([padding])]);
            body = Buffer.concat([body, fontimg]);

            if (codepoints[i + 1] == null || codepoints[i] + 1 !== codepoints[i + 1]) {
                // End of continuous block
                blkcnt ++;
                const blkEntry = Buffer.alloc(6);
                blkEntry.writeUInt16LE(blkstart, 0);
                blkEntry.writeUInt16LE(codepoints[i], 2);
                blkEntry.writeUInt16LE(seqcnt, 4);
                header = Buffer.concat([header, blkEntry]);
                seqcnt += codepoints[i] - blkstart + 1;
                blkstart = codepoints[i + 1] != null ? codepoints[i + 1] : -1;
            }
        }

        header.writeUInt16LE(blkcnt, 0x20);

        return Buffer.concat([header, body]);
    }
}

if (exportFlag) {
    module.exports = BIPFont;
}
