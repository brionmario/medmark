'use client';

import { useCallback, useEffect, useState, useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import { MedmarkLogo } from '@/components/logo';

/* ── Brand / feature data ─────────────────────────────── */

const FEATURES = [
  { icon: '✦', label: 'Clean Markdown' },
  { icon: '⊞', label: 'YAML Front Matter' },
  { icon: '◈', label: 'Custom Templates' },
  { icon: '◉', label: 'Image Handling' },
  { icon: '⋆', label: 'MDX Support' },
  { icon: '⌘', label: 'CLI First' },
  { icon: '◇', label: 'Draft Export' },
  { icon: '⟡', label: 'Tag Mapping' },
];

/* ── Terminal data ────────────────────────────────────── */

type TermLine =
  | { kind: 'cmd' }
  | { kind: 'gap' }
  | { kind: 'info'; text: string }
  | { kind: 'prompt'; q: string; a: string }
  | { kind: 'work'; text: string }
  | { kind: 'ok'; label: string; bar?: boolean; count?: string }
  | { kind: 'done'; text: string };

const SCRIPT: TermLine[] = [
  { kind: 'cmd' },
  { kind: 'gap' },
  { kind: 'info', text: '  medmark  ·  Medium → Markdown' },
  { kind: 'gap' },
  { kind: 'prompt', q: '  ? Path to posts folder', a: '› ./medium-export/posts' },
  { kind: 'prompt', q: '  ? Output destination  ', a: '› ./output' },
  { kind: 'prompt', q: '  ? Export drafts?      ', a: '› No' },
  { kind: 'gap' },
  { kind: 'work', text: '  ◆ Scanning posts...' },
  { kind: 'ok',   label: '  ✓ Found 42 articles' },
  { kind: 'gap' },
  { kind: 'ok', label: '  ✓ Converting ', bar: true, count: '42 / 42' },
  { kind: 'ok', label: '  ✓ Downloading', bar: true, count: '36 / 36' },
  { kind: 'ok', label: '  ✓ Writing output files' },
  { kind: 'gap' },
  { kind: 'done', text: '  ✓ Done!  42 posts → ./output' },
];

// Delay (ms) before each line appears (index matches SCRIPT)
const DELAYS = [0, 300, 150, 400, 550, 480, 380, 800, 250, 950, 200, 1100, 850, 650, 350, 350];

const CMD_TEXT = '$ npx medmark';
const TYPING_SPEED = 65; // ms per character

/* ── AnimatedTerminal component ───────────────────────── */

function TermLineEl({ line }: { line: TermLine; }) {
  switch (line.kind) {
    case 'gap':
      return <div className="term-gap" />;
    case 'info':
      return <div className="term-line term-info">{line.text}</div>;
    case 'prompt':
      return (
        <div className="term-line term-prompt-line">
          <span className="term-prompt-q">{line.q}</span>
          <span className="term-prompt-sep">  </span>
          <span className="term-prompt-arrow">›</span>
          <span className="term-prompt-a"> {line.a.replace('› ', '')}</span>
        </div>
      );
    case 'work':
      return <div className="term-line term-work">{line.text}</div>;
    case 'ok':
      return (
        <div className="term-line term-ok">
          {line.label}
          {line.bar && (
            <>
              <span className="term-bar"> ████████████████ </span>
              <span className="term-count">{line.count}</span>
            </>
          )}
        </div>
      );
    case 'done':
      return <div className="term-line term-done">{line.text}</div>;
    default:
      return null;
  }
}

function AnimatedTerminal() {
  // Each run is a fresh mount, so the animation restarts from pristine state
  // instead of resetting it synchronously inside an effect.
  const [cycle, setCycle] = useState(0);
  const onFinished = useCallback(() => setCycle(c => c + 1), []);

  return <TerminalRun key={cycle} onFinished={onFinished} />;
}

function TerminalRun({ onFinished }: { onFinished: () => void; }) {
  const [typed, setTyped]     = useState('');
  const [visible, setVisible] = useState(0); // how many lines after cmd are shown
  const [cmdDone, setCmdDone] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Phase 1 – type the command
    const typeStart = 700;
    for (let i = 1; i <= CMD_TEXT.length; i++) {
      const idx = i;
      timers.push(setTimeout(() => setTyped(CMD_TEXT.slice(0, idx)), typeStart + idx * TYPING_SPEED));
    }
    const afterCmd = typeStart + CMD_TEXT.length * TYPING_SPEED + 300;
    timers.push(setTimeout(() => setCmdDone(true), afterCmd - 150));

    // Phase 2 – reveal subsequent lines
    let cumDelay = afterCmd;
    DELAYS.slice(1).forEach((delay, i) => {
      cumDelay += delay;
      const lineIdx = i + 1;
      timers.push(setTimeout(() => setVisible(lineIdx), cumDelay));
    });

    // Phase 3 – restart loop
    timers.push(setTimeout(onFinished, cumDelay + 2800));

    return () => timers.forEach(clearTimeout);
  }, [onFinished]);

  const showCmdCursor = !cmdDone || visible < SCRIPT.length - 1;

  return (
    <div className="term-window">
      {/* Title bar */}
      <div className="term-titlebar">
        <div className="term-dots">
          <span className="term-dot" style={{ background: '#FF5F57' }} />
          <span className="term-dot" style={{ background: '#FEBC2E' }} />
          <span className="term-dot" style={{ background: '#28C840' }} />
        </div>
        <span className="term-title-label">medmark — zsh</span>
      </div>

      {/* Body */}
      <div className="term-body">
        {/* Command row */}
        <div className="term-line term-cmd-line">
          <span className="term-typed">{typed}</span>
          {showCmdCursor && <span className="term-cursor" />}
        </div>

        {/* Revealed lines */}
        {SCRIPT.slice(1).map((line, i) =>
          visible > i ? <TermLineEl key={i} line={line} /> : null
        )}

        {/* Final prompt after done */}
        {visible >= SCRIPT.length - 1 && (
          <div className="term-line term-cmd-line" style={{ marginTop: '0.5rem' }}>
            <span className="term-typed">$ </span>
            <span className="term-cursor" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────── */

export default function HomePage() {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMouse({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  const para = (fx: number, fy: number): CSSProperties => ({
    transform: `translate(${(mouse.x - 0.5) * fx}px, ${(mouse.y - 0.5) * fy}px)`,
    transition: 'transform 0.12s ease-out',
  });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText('npx medmark');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* noop */ }
  };

  return (
    <div className="hero-root">
      {/* Parallax orbs */}
      <div className="hero-orb hero-orb-1" style={para(-45, -30)} />
      <div className="hero-orb hero-orb-2" style={para(35, 25)} />
      <div className="hero-orb hero-orb-3" style={para(-22, 38)} />
      <div className="hero-grid" />

      {/* Two-column inner */}
      <div className="hero-inner">

        {/* Left: text content */}
        <div className="hero-left">
          <div className="hero-logo-wrap" style={para(-10, -7)}>
            <MedmarkLogo height={40} className="logo-on-dark text-white" />
          </div>

          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span>Open Source · MIT License</span>
          </div>

          <h1 className="hero-headline">
            Export your Medium<br />
            stories to <span className="hero-accent">Markdown</span>
          </h1>

          <p className="hero-sub">
            Clean, fast, and framework-ready. Drop your content into Next.js, Astro, Hugo, or any static-site generator — no lock-in.
          </p>

          <div className="hero-ctas">
            <Link href="/docs" className="hero-btn-primary">
              Read the Docs →
            </Link>
            <button onClick={copy} className="hero-btn-secondary" type="button">
              <span className="hero-cmd">$</span>
              <code>npx medmark</code>
              <span className="hero-copy-icon">{copied ? '✓' : '⊕'}</span>
            </button>
          </div>

          <div className="hero-features">
            {FEATURES.map((f) => (
              <div key={f.label} className="hero-feature-pill">
                <span className="hero-feature-icon">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right: animated terminal (desktop only) */}
        <div className="hero-right">
          <AnimatedTerminal />
        </div>

      </div>
    </div>
  );
}
