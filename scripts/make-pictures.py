"""
Builds the site's pictures (public/img/*.webp) from the full-size films in public/media.

Each slot names a film and a frame; the frame is cut out of the large (1920x1080) film, cropped to the shape the
picture is shown in, graded to the site's dark cinematic look (deep shadows, cool blacks, warm gold highlights, vignette)
and saved as WebP.

Needs: pip install opencv-python-headless pillow numpy
Run from the repo root:  python scripts/make-pictures.py
"""
import os
import sys

import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEDIA = os.path.join(ROOT, 'public', 'media')
OUT = os.path.join(ROOT, 'public', 'img')

# film, frame (0-239), output name, output size (w, h), crop centre (x, y as 0-1 of the frame), target mean brightness
# (None keeps the frame's own exposure), quality
SLOTS = [
    # hero: desktop and phone crops of the plane in the sky
    ('hero-film', 130, 'hero', (1920, 1080), (0.50, 0.50), 0.30, 74),
    ('hero-film', 130, 'hero-m', (810, 1080), (0.50, 0.50), 0.30, 74),
    # hero floating cards
    ('still-life', 90, 'float-1', (800, 600), (0.52, 0.55), None, 76),
    ('statement-window', 130, 'float-2', (800, 600), (0.55, 0.50), None, 76),
    ('scramble-film', 10, 'float-3', (800, 600), (0.60, 0.55), None, 76),
    # services: pale studio frames are pulled down hard, the highlights stay
    ('s01', 90, 'svc-01', (1400, 966), (0.52, 0.50), 0.30, 76),
    ('s02', 130, 'svc-02', (1400, 966), (0.58, 0.50), 0.30, 76),
    ('s03', 110, 'svc-03', (1400, 966), (0.50, 0.50), 0.30, 76),
    ('s04', 90, 'svc-04', (1400, 966), (0.50, 0.55), 0.30, 76),
    ('s05', 110, 'svc-05', (1400, 966), (0.52, 0.50), 0.30, 76),
    ('s06', 170, 'svc-06', (1400, 966), (0.46, 0.55), 0.30, 76),
    # approach and reach
    ('close-landing', 90, 'approach-1', (1400, 966), (0.50, 0.50), None, 76),
    ('statement-window', 210, 'approach-2', (1400, 966), (0.50, 0.50), None, 76),
    ('still-life', 190, 'approach-3', (1400, 966), (0.55, 0.50), None, 76),
    ('nav-2', 10, 'reach', (1400, 966), (0.40, 0.50), None, 76),
]


# stronger edge darkening for the pale studio frames, so the subject stays lit and the room falls away
VIGNETTE = {'svc-01': 0.9, 'svc-02': 0.85, 'svc-03': 1.0, 'svc-04': 1.0, 'svc-05': 0.9, 'svc-06': 0.9}


# dark subject on a pale wall: roll the wall down instead of crushing the subject
ROLLOFF = {'svc-01', 'svc-05', 'svc-06'}


def luma(a):
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]


def grade(rgb, target, vig=0.5, studio=False):
    a = rgb.astype(np.float32) / 255.0
    if studio:
        # pale studio frame: roll the bright walls down and keep the detail in the dark subject
        a = a * (1 - 0.72 * a)
        a = np.clip(a * 1.35, 0, 1) ** 0.9
        target = None
    # 1. pull the exposure down until the mean brightness reaches the target (highlights stay near white)
    if target is not None:
        lo, hi = 1.0, 3.0
        if luma(a).mean() > target:
            for _ in range(24):
                g = (lo + hi) / 2
                if (luma(a) ** g).mean() > target:
                    lo = g
                else:
                    hi = g
            a = a ** ((lo + hi) / 2)
    # 2. contrast: blend towards a smoothstep S-curve
    s = a * a * (3 - 2 * a)
    a = a + (0.45 if studio else 0.55) * (s - a)
    # 3. slightly muted colour
    l = luma(a)[..., None]
    a = l + (a - l) * 0.9
    # 4. split tone: cool blacks, gold highlights
    l = luma(a)[..., None]
    a = a + ((1 - l) ** 2) * np.array([-0.010, 0.012, 0.030], np.float32)
    a = a + (l ** 2.2) * np.array([0.040, 0.020, -0.025], np.float32)
    # 5. vignette
    h, w = a.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / np.sqrt(2)
    a = a * (1 - vig * r ** 1.6)[..., None]
    # a small black lift keeps the darkest areas from turning flat
    a = a * 0.97 + 0.012
    return (np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)


def grab(film, idx):
    cap = cv2.VideoCapture(os.path.join(MEDIA, film + '-l.mp4'))
    cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
    ok, fr = cap.read()
    cap.release()
    if not ok:
        sys.exit(f'cannot read frame {idx} of {film}')
    return cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)


def crop(rgb, size, centre):
    h, w = rgb.shape[:2]
    ow, oh = size
    ratio = ow / oh
    cw, ch = (w, int(round(w / ratio))) if w / h < ratio else (int(round(h * ratio)), h)
    x = int(round(min(max(centre[0] * w - cw / 2, 0), w - cw)))
    y = int(round(min(max(centre[1] * h - ch / 2, 0), h - ch)))
    return rgb[y:y + ch, x:x + cw]


def main():
    os.makedirs(OUT, exist_ok=True)
    for film, idx, name, size, centre, target, quality in SLOTS:
        img = grade(crop(grab(film, idx), size, centre), target, VIGNETTE.get(name, 0.5), name in ROLLOFF)
        pil = Image.fromarray(img)
        if pil.size != size:
            pil = pil.resize(size, Image.LANCZOS)
        path = os.path.join(OUT, name + '.webp')
        pil.save(path, 'WEBP', quality=quality, method=6)
        print(f'{name:12s} {size[0]}x{size[1]}  {os.path.getsize(path) // 1024} KB')


if __name__ == '__main__':
    main()
