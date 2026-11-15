import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import site from '@/site.config';
import {themes, type Palette, type Theme, type ThemeName} from '../themes';

export const metadata: Metadata = {robots: {follow: false, index: false}, title: 'Themes'};

/** One sample of a palette: roughly what the home page looks like in it. */
function Sample({palette, scheme}: {palette: Palette; scheme: string}) {
  return (
    <div
      style={{
        backgroundColor: palette.paper,
        border: `1px solid ${palette.line}`,
        borderRadius: '10px',
        color: palette.ink,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          alignItems: 'center',
          borderBottom: `1px solid ${palette.line}`,
          color: palette.soft,
          display: 'flex',
          fontSize: '11px',
          justifyContent: 'space-between',
          padding: '10px 16px',
        }}
      >
        <span style={{color: palette.ink, fontFamily: 'var(--font-serif)', fontSize: '14px'}}>{site.name}</span>
        <span>{scheme}</span>
      </div>

      <div style={{padding: '18px 16px'}}>
        <p style={{fontFamily: 'var(--font-serif)', fontSize: '19px', lineHeight: 1.25, margin: 0}}>
          {site.tagline || 'Writing about the things I build.'}
        </p>
        <p style={{color: palette.soft, fontSize: '12px', lineHeight: 1.6, margin: '10px 0 0'}}>
          A date, an excerpt and the quiet text all use this tone.
        </p>
        <p style={{fontSize: '12px', margin: '14px 0 0'}}>
          <span
            style={{
              textDecorationColor: palette.accent,
              textDecorationLine: 'underline',
              textDecorationThickness: '1px',
              textUnderlineOffset: '3px',
            }}
          >
            A link
          </span>
          <span
            style={{
              backgroundColor: palette.accentSoft,
              border: `1px solid ${palette.line}`,
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              marginLeft: '10px',
              padding: '2px 6px',
            }}
          >
            inline code
          </span>
        </p>
      </div>
    </div>
  );
}

/**
 * A dev-only gallery of every theme in `app/themes.ts`, so a look can be
 * chosen by eye rather than by hex. Production builds 404 this page.
 */
export default function ThemesPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const names = Object.keys(themes) as ThemeName[];

  return (
    <section className="py-12">
      <h1 className="font-serif text-[2rem] leading-tight tracking-tight">Themes</h1>
      <p className="text-soft mt-4 max-w-[34rem] leading-relaxed">
        Set <code className="font-mono text-sm">theme</code> in{' '}
        <code className="font-mono text-sm">site.config.ts</code> to one of these. The colours live in{' '}
        <code className="font-mono text-sm">app/themes.ts</code> — copy a block to make your own.
      </p>
      <p className="text-soft mt-2 text-sm">
        This page only exists while running <code className="font-mono">npm run dev</code>.
      </p>

      <div className="mt-12 space-y-12">
        {names.map((name: ThemeName) => {
          const theme: Theme = themes[name];
          const selected: boolean = name === site.theme;

          return (
            <section key={name}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="font-serif text-xl tracking-tight">{theme.label}</h2>
                <code className="text-soft font-mono text-xs">theme: &apos;{name}&apos;</code>
                {selected && (
                  <span className="border-line text-soft rounded-full border px-2 py-0.5 text-[0.625rem] tracking-wide uppercase">
                    In use
                  </span>
                )}
              </div>

              <p className="text-soft mt-2 text-sm leading-relaxed">{theme.description}</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Sample palette={theme.light} scheme="Light" />
                <Sample palette={theme.dark} scheme="Dark" />
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
