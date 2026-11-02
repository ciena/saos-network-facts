// SPDX-License-Identifier: Apache-2.0
// PNG export of the layer frames: one picture per frame (and per scale), rasterised with resvg
// (@resvg/resvg-js, a Rust SVG renderer with Node bindings: no browser). Node only.
//
// Each frame is drawn from a still SVG of its own (frames() result.still(id): that frame's group and the
// background, no rotation CSS, since resvg runs no CSS animation), at each scale.
//
// Fonts: the frames ask for 'Segoe UI', Roboto, Helvetica, Arial, then sans-serif. resvg loads the
// system fonts and draws the first of those it finds; when it finds none, the generic families map to
// DejaVu Sans (on most Linux machines and CI runners). `fontFiles` (the CLI's --font) adds font files
// and `fontFamily` makes one family the default for all text, which gives the same pictures on any
// machine that has the file.

async function loadResvg() {
  try {
    return (await import('@resvg/resvg-js')).Resvg;
  } catch {
    throw new Error('PNG export needs the @resvg/resvg-js package (npm install @resvg/resvg-js@2.6.2)');
  }
}

// [{ id, scale, png (Buffer), width, height }] for every frame of `result` (frames() output) at
// every scale.
export async function framePngs(result, { scales = [1, 2], fontFiles = [], fontFamily = null } = {}) {
  const Resvg = await loadResvg();
  const family = fontFamily ?? 'DejaVu Sans';
  const font = { loadSystemFonts: true, fontFiles, defaultFontFamily: family, sansSerifFamily: family };
  const out = [];
  for (const { id } of result.frames) {
    let still = result.still(id);
    if (fontFamily) still = still.replace(/font-family="[^"]*"/, `font-family="${fontFamily.replace(/"/g, '')}"`);
    for (const scale of scales) {
      const img = new Resvg(still, { font, fitTo: { mode: 'zoom', value: scale }, background: '#ffffff' }).render();
      out.push({ id, scale, png: img.asPng(), width: img.width, height: img.height });
    }
  }
  return out;
}

// The file name of one PNG: <name>.<frame>.png at 1x, <name>.<frame>@<scale>x.png otherwise.
export const pngName = (name, id, scale) => `${name}.${id}${scale === 1 ? '' : `@${scale}x`}.png`;
