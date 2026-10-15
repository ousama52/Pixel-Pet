"""Slice DawnLike (CC-BY 4.0) tiles into per-character Pixel Pet sprite sheets.

Output layout for each character sheet.png:
    columns = animation frames (2, from DawnLike's *0.png / *1.png files)
    rows    = evolution stages (4: baby, child, teen, adult)
"""
import os
from PIL import Image

TEMP = os.environ['TEMP']
SRC = os.path.join(TEMP, 'ppassets', 'dawnlike')
PROJ = r'c:\Users\MinYeHtut\Downloads\Project\Ga'
TILE = 16

# id -> (dawnlike sheet, [(col, row) per evolution stage: baby, child, teen, adult])
CHARACTERS = {
    'chick':   ('Characters/Avian',   [(0, 0), (1, 0), (0, 9), (1, 9)]),
    'newt':    ('Characters/Reptile', [(0, 8), (1, 8), (2, 8), (1, 9)]),
    'cat':     ('Characters/Cat',     [(0, 1), (1, 1), (2, 1), (1, 0)]),
    'dragon':  ('Characters/Reptile', [(2, 0), (0, 1), (1, 1), (1, 3)]),
    'penguin': ('Characters/Avian',   [(0, 3), (2, 3), (1, 3), (3, 3)]),
    'ghost':   ('Characters/Undead',  [(0, 4), (1, 4), (2, 4), (1, 6)]),
}

# UI / prop icons: name -> (sheet file, col, row)
ICONS = {
    'apple':  ('Items/Food.png', 0, 2),
    'orange': ('Items/Food.png', 1, 2),
    'melon':  ('Items/Food.png', 3, 2),
    'banana': ('Items/Food.png', 4, 2),
    'berry':  ('Items/Food.png', 6, 2),
    'sushi':  ('Items/Food.png', 1, 4),
    'donut':  ('Items/Food.png', 3, 5),
    'cake':   ('Items/Food.png', 4, 5),
    'lute':   ('Items/Music.png', 1, 0),
    'brush':  ('Items/Tool.png', 0, 0),
    'bed':    ('Objects/Decor0.png', 1, 6),
    'potion': ('Items/Potion.png', 0, 0),
}


def tile(img, col, row):
    return img.crop((col * TILE, row * TILE, (col + 1) * TILE, (row + 1) * TILE))


def export_characters():
    for cid, (sheet, stages) in CHARACTERS.items():
        frames = [Image.open(os.path.join(SRC, f'{sheet}{i}.png')).convert('RGBA') for i in (0, 1)]
        out = Image.new('RGBA', (TILE * 2, TILE * len(stages)), (0, 0, 0, 0))
        for s, (col, row) in enumerate(stages):
            for f, img in enumerate(frames):
                t = tile(img, col, row)
                if not t.getbbox():
                    raise SystemExit(f'{cid} stage {s} frame {f} is empty at {(col, row)}')
                out.paste(t, (f * TILE, s * TILE))
        d = os.path.join(PROJ, 'src', 'assets', 'characters', cid)
        os.makedirs(d, exist_ok=True)
        p = os.path.join(d, 'sheet.png')
        out.save(p)
        print(f'{cid:8s} {out.size}  {os.path.getsize(p)}b')


def export_icons():
    d = os.path.join(PROJ, 'src', 'assets', 'icons')
    os.makedirs(d, exist_ok=True)
    for name, (sheet, col, row) in ICONS.items():
        img = Image.open(os.path.join(SRC, sheet)).convert('RGBA')
        t = tile(img, col, row)
        if not t.getbbox():
            raise SystemExit(f'icon {name} is empty at {(col, row)}')
        t.save(os.path.join(d, f'{name}.png'))
    print(f'icons: {len(ICONS)} ->', d)


export_characters()
export_icons()
