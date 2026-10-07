#!/usr/bin/env python3
import json
import os
import subprocess

PATH_D = open('/tmp/traced_mask.svg').read().split('d="')[1].split('"')[0]

THEMES = {
    'orc-dark': {
        'bg': '#02571E',
        'border': '#1E3B1A',
        'shadow': '#020602',
        'theme_color': '#02571E',
        'background_color': '#080F07',
        'fill': '#FFFFFF'
    },
    'orc-light': {
        'bg': '#0D3309',
        'border': '#234A1F',
        'shadow': '#0C2609',
        'theme_color': '#0D3309',
        'background_color': '#F9FBF9',
        'fill': '#FFFFFF'
    },
    'dark': {
        'bg': '#D9381E',
        'border': '#273463',
        'shadow': '#040714',
        'theme_color': '#D9381E',
        'background_color': '#0A0F24',
        'fill': '#FFFFFF'
    },
    'light': {
        'bg': '#EC4899',
        'border': '#18181B',
        'shadow': '#18181B',
        'theme_color': '#EC4899',
        'background_color': '#FFFDFA',
        'fill': '#FFFFFF'
    }
}

def generate_svg(col):
    return f'''<svg height="200" viewBox="0 0 200 200" width="200" xmlns="http://www.w3.org/2000/svg">
  <title>Orc&apos;estra Gamificação</title>
  <!-- Sombra rígida neo-brutalista -->
  <rect fill="{col['shadow']}" height="176" rx="36" width="176" x="16" y="16" />
  <!-- Card base temático -->
  <rect fill="{col['bg']}" height="176" rx="36" stroke="{col['border']}" stroke-linejoin="round" stroke-width="8" width="176" x="8" y="8" />
  <!-- Máscara do Orc oficial em alto contraste -->
  <g transform="translate(-4, -4)">
    <path d="{PATH_D}" fill="{col['fill']}" fill-rule="evenodd" />
  </g>
</svg>'''

os.makedirs('apps/web/public/favicon', exist_ok=True)
os.makedirs('apps/docs/src/assets', exist_ok=True)

# 1. Generate SVGs for all themes
for theme_name, col in THEMES.items():
    svg_content = generate_svg(col)
    dest_path = f'apps/web/public/favicon/favicon-{theme_name}.svg'
    with open(dest_path, 'w') as f:
        f.write(svg_content)
    print(f'Wrote {dest_path}')

# Default favicon.svg (Orc Dark)
with open('apps/web/public/favicon/favicon.svg', 'w') as f:
    f.write(generate_svg(THEMES['orc-dark']))
print('Wrote apps/web/public/favicon/favicon.svg')

# 2. Render PNGs using rsvg-convert (Default icons)
png_targets = [
    ('apps/web/public/favicon/favicon.svg', 'apps/web/public/favicon/favicon-96x96.png', 96),
    ('apps/web/public/favicon/favicon.svg', 'apps/web/public/favicon/apple-touch-icon.png', 180),
    ('apps/web/public/favicon/favicon.svg', 'apps/web/public/apple-touch-icon.png', 180),
    ('apps/web/public/favicon/favicon.svg', 'apps/web/public/favicon/web-app-manifest-192x192.png', 192),
    ('apps/web/public/favicon/favicon.svg', 'apps/web/public/web-app-manifest-192x192.png', 192),
    ('apps/web/public/favicon/favicon.svg', 'apps/web/public/favicon/web-app-manifest-512x512.png', 512),
    ('apps/web/public/favicon/favicon.svg', 'apps/web/public/web-app-manifest-512x512.png', 512),
    ('apps/web/public/favicon/favicon.svg', 'apps/docs/src/assets/logo.png', 512),
]

for src_svg, dest_png, size in png_targets:
    cmd = ['rsvg-convert', src_svg, '-w', str(size), '-h', str(size), '-o', dest_png]
    subprocess.run(cmd, check=True)
    print(f'Rendered {dest_png} ({size}x{size})')

# 3. Render Theme-specific PNGs and Web Manifests for each theme
for t, conf in THEMES.items():
    svg_file = f'apps/web/public/favicon/favicon-{t}.svg'
    for size, name in [
        (180, f'apple-touch-icon-{t}.png'),
        (192, f'web-app-manifest-192x192-{t}.png'),
        (512, f'web-app-manifest-512x512-{t}.png'),
    ]:
        out = f'apps/web/public/favicon/{name}'
        cmd = ['rsvg-convert', svg_file, '-w', str(size), '-h', str(size), '-o', out]
        subprocess.run(cmd, check=True)
        print(f'Rendered {out} ({size}x{size})')

    manifest_data = {
        'name': 'orc//desafios',
        'short_name': 'orc//desafios',
        'description': 'Desafios técnicos em duplas, suporte via WhatsApp e gamificação para a Empresa Júnior.',
        'start_url': '/dashboard',
        'scope': '/',
        'id': '/dashboard',
        'display': 'standalone',
        'orientation': 'portrait',
        'background_color': conf['background_color'],
        'theme_color': conf['theme_color'],
        'icons': [
            {
                'src': f'/favicon/web-app-manifest-192x192-{t}.png',
                'sizes': '192x192',
                'type': 'image/png',
                'purpose': 'maskable'
            },
            {
                'src': f'/favicon/web-app-manifest-192x192-{t}.png',
                'sizes': '192x192',
                'type': 'image/png',
                'purpose': 'any'
            },
            {
                'src': f'/favicon/web-app-manifest-512x512-{t}.png',
                'sizes': '512x512',
                'type': 'image/png',
                'purpose': 'maskable'
            },
            {
                'src': f'/favicon/web-app-manifest-512x512-{t}.png',
                'sizes': '512x512',
                'type': 'image/png',
                'purpose': 'any'
            },
            {
                'src': f'/favicon/apple-touch-icon-{t}.png',
                'sizes': '180x180',
                'type': 'image/png',
                'purpose': 'any'
            }
        ]
    }
    manifest_path = f'apps/web/public/manifest-{t}.webmanifest'
    with open(manifest_path, 'w') as f:
        json.dump(manifest_data, f, indent=2)
    print(f'Wrote {manifest_path}')

print('All assets successfully generated!')
