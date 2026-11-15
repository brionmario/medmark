/**
 * The looks this blog can wear.
 *
 * This file is the single source of truth for colour: `app/layout.tsx` turns
 * the selected theme into CSS variables, and everything else — components,
 * post body, code blocks — reads those variables. Nothing hard-codes a colour.
 *
 * Pick one with `theme` in `site.config.ts`, or add your own: copy a block,
 * give it a name, and keep the same seven keys.
 */
export interface Palette {
  /** Page background. */
  paper: string;
  /** Slightly raised surfaces — code blocks, table headers. */
  raised: string;
  /** Body text. */
  ink: string;
  /** Secondary text: dates, excerpts, captions. Keep it legible on `paper`. */
  soft: string;
  /** Hairlines and borders. */
  line: string;
  /** The one accent: link underlines, hover, quote rules, tag hover. */
  accent: string;
  /** A tint of the accent, behind inline code. */
  accentSoft: string;
}

export interface Theme {
  /** Shown in the dev-only theme gallery at /themes. */
  label: string;
  /** One line on when this look fits. */
  description: string;
  light: Palette;
  dark: Palette;
}

export const themes = {
  clay: {
    label: 'Clay',
    description: 'Warm paper and ink with a terracotta accent. Editorial, quiet, good for long reads.',
    light: {
      paper: '#fbfaf7',
      raised: '#ffffff',
      ink: '#141312',
      soft: '#6b6861',
      line: '#e7e3da',
      accent: '#a94f26',
      accentSoft: '#fdf1ea',
    },
    dark: {
      paper: '#111110',
      raised: '#171715',
      ink: '#eceae5',
      soft: '#948f86',
      line: '#272521',
      accent: '#e0875c',
      accentSoft: '#231a15',
    },
  },
  ink: {
    label: 'Ink',
    description: 'Cool greys and a classic blue link. The plainest of the four — gets out of the way.',
    light: {
      paper: '#fcfcfc',
      raised: '#ffffff',
      ink: '#16181d',
      soft: '#5f6672',
      line: '#e6e8ec',
      accent: '#1f5fd0',
      accentSoft: '#eef3fd',
    },
    dark: {
      paper: '#0d0f12',
      raised: '#14171c',
      ink: '#e7e9ec',
      soft: '#9aa1ac',
      line: '#22262d',
      accent: '#6ea8fe',
      accentSoft: '#141a24',
    },
  },
  forest: {
    label: 'Forest',
    description: 'Cool off-white with a deep green accent. Calm, a little technical.',
    light: {
      paper: '#f9faf8',
      raised: '#ffffff',
      ink: '#141612',
      soft: '#61685c',
      line: '#e2e8df',
      accent: '#26674b',
      accentSoft: '#ecf4ef',
    },
    dark: {
      paper: '#0f1210',
      raised: '#151915',
      ink: '#e9ece7',
      soft: '#8c948a',
      line: '#232823',
      accent: '#5fbf95',
      accentSoft: '#15201a',
    },
  },
  plum: {
    label: 'Plum',
    description: 'Faintly violet paper with a deep purple accent. The most personal of the four.',
    light: {
      paper: '#fbfafc',
      raised: '#ffffff',
      ink: '#15131a',
      soft: '#65607a',
      line: '#e8e4ee',
      accent: '#6d4aa8',
      accentSoft: '#f3eefb',
    },
    dark: {
      paper: '#111017',
      raised: '#17161e',
      ink: '#ebe9f0',
      soft: '#918ca1',
      line: '#272433',
      accent: '#b48ad6',
      accentSoft: '#1c1726',
    },
  },
} satisfies Record<string, Theme>;

export type ThemeName = keyof typeof themes;

/** `--paper: #fbfaf7; --raised: …` for one palette. */
function declarations(palette: Palette): string {
  return [
    `--paper:${palette.paper}`,
    `--raised:${palette.raised}`,
    `--ink:${palette.ink}`,
    `--soft:${palette.soft}`,
    `--line:${palette.line}`,
    `--accent:${palette.accent}`,
    `--accent-soft:${palette.accentSoft}`,
  ].join(';');
}

/**
 * The stylesheet for one theme: light on `:root`, dark on `:root.dark`, which
 * the toggle in the header switches between.
 */
export function themeCss(name: ThemeName): string {
  const theme: Theme = themes[name];

  return `:root{${declarations(theme.light)}}:root.dark{${declarations(theme.dark)}}`;
}
