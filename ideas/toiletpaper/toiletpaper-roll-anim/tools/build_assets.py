#!/usr/bin/env python3
"""
Rebuild everything in assets/ from assets/source/toiletpaper.png.

    pip install pillow numpy scipy
    python3 tools/build_assets.py

Nothing here is hand-drawn. Each asset is derived from the photograph, and
each one exists to solve a specific problem with tiling a photo down a page
of unknown length:

  roll.png      the holder and cylinder, cut at the silhouette. It carries
                NO photographed paper, so the page contains exactly one
                piece of paper and there is no second one to mismatch.

  grain.png     the paper's embossed texture, phase-randomised in the
  cloud.png     frequency domain. FFT synthesis is periodic by construction,
                so these tile with no seam at all. Their sizes are coprime
                (160 / 233) so the combined pattern repeats only every
                37,280 px, which no page will ever reach.

  cylmask.png   the cylinder's silhouette, so the rotating texture stops
                where the roll does instead of filling its bounding box.

  tearmask.png  the torn bottom edge, with the photo's taper straightened
                out so its sides line up with the (vertical) rail.

The vertical shading is deliberately NOT baked into grain.png. Row-mean
brightness in the source swings from 174 to 230, and tiling that produces a
visible band at every repeat. It is removed here and reapplied once, as a
CSS gradient, in css/styles.css.
"""

import os
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SRC = os.path.join(ROOT, "assets", "source", "toiletpaper.png")
OUT = os.path.join(ROOT, "assets")

# Regions measured off the source photograph (925 x 1059).
ROLL_BOX = (275, 0, 650, 320)      # holder + cylinder, cut at the silhouette
CYL_BOX = (312, 114, 572, 322)     # the cylinder alone
PAPER_X = (347, 563)               # the paper's frame, shared by rail and tail
CLEAN_Y = (440, 900)               # paper with no perforation in it
TEAR_Y = (926, 966)                # the torn end
FIT_Y = (900, 957)                 # clean rows used to fit the paper's taper


def synth(patch, n, lo, hi, std, seed):
    """A tile with the same power spectrum as `patch` but random phase.

    The inverse FFT of a discrete spectrum is periodic, so the result tiles
    exactly — there is no seam to hide. Band-passing first drops the low
    frequencies that would otherwise make the repeat visible.
    """
    band = ndimage.gaussian_filter(patch, lo) - ndimage.gaussian_filter(patch, hi)
    band = band[:n, :n] - band[:n, :n].mean()
    spectrum = np.fft.fft2(band)
    rng = np.random.default_rng(seed)
    phase = rng.uniform(0, 2 * np.pi, spectrum.shape)
    phase = (phase - phase[::-1, ::-1]) / 2          # keep the output real
    out = np.real(np.fft.ifft2(np.abs(spectrum) * np.exp(1j * phase)))
    return out * (std / (out.std() + 1e-9))


def main():
    src = Image.open(SRC).convert("RGBA")
    lum = np.array(src.convert("LA"), np.float32)[..., 0]
    alpha = np.array(src)[..., 3].astype(np.float32) / 255
    x0, x1 = PAPER_X

    src.crop(ROLL_BOX).convert("LA").save(f"{OUT}/roll.png", optimize=True)

    patch = lum[CLEAN_Y[0]:CLEAN_Y[1], x0 + 11:x1 - 11]
    for name, n, lo, hi, std, seed, base in [
        ("grain", 160, 0.6, 6, 6.0, 7, 250),
        ("cloud", 233, 4.0, 26, 2.2, 21, 252),
    ]:
        tile = np.clip(base - synth(patch, n, lo, hi, std, seed), 0, 255)
        Image.fromarray(tile.astype(np.uint8), "L").save(f"{OUT}/{name}.png", optimize=True)

    a = alpha[CYL_BOX[1]:CYL_BOX[3], CYL_BOX[0]:CYL_BOX[2]]
    a = np.clip((ndimage.gaussian_filter(a, 1.1) - 0.10) / 0.85, 0, 1)
    save_alpha(a, f"{OUT}/cylmask.png")

    # The photographed paper narrows as it falls. Fit both edges on clean
    # rows, then resample every row of the tear so it spans the full width.
    ys = np.arange(*FIT_Y)
    left = np.polyfit(ys, [np.where(alpha[y] > .25)[0].min() for y in ys], 1)
    right = np.polyfit(ys, [np.where(alpha[y] > .25)[0].max() for y in ys], 1)
    w = x1 - x0
    cols = np.arange(w)
    tear = np.zeros((TEAR_Y[1] - TEAR_Y[0], w), np.float32)
    for i, y in enumerate(range(*TEAR_Y)):
        l, r = np.polyval(left, y), np.polyval(right, y)
        tear[i] = np.interp(l + (cols - 1.5) * (r - l) / (w - 3.0),
                            np.arange(alpha.shape[1]), alpha[y])
    save_alpha(ndimage.gaussian_filter(tear, 0.5), f"{OUT}/tearmask.png")

    for f in ("roll", "grain", "cloud", "cylmask", "tearmask"):
        p = f"{OUT}/{f}.png"
        print(f"  {f + '.png':16} {Image.open(p).size!s:12} {os.path.getsize(p):>7,} bytes")


def save_alpha(a, path):
    """Shape carried entirely by the alpha channel — compresses to a few KB."""
    out = np.zeros(a.shape + (4,), np.uint8)
    out[..., 3] = (np.clip(a, 0, 1) * 255).astype(np.uint8)
    Image.fromarray(out, "RGBA").save(path, optimize=True)


if __name__ == "__main__":
    main()
