'use client';

import {useState} from 'react';
import {Check, Copy, FolderCode} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';
import {ClaudeIcon, CursorIcon, NpmIcon, OpenAiIcon} from '@/components/brand-icons';
import {cn} from '@/lib/cn';

interface InstallPath {
  /** Commands to run, in order. Shown one per line. */
  commands: string[];
  /** One line under the commands explaining what this path gives you. */
  hint: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Tab text, e.g. "Claude Code". */
  label: string;
}

/**
 * How people actually reach medmark: the CLI itself, and the agent skill in
 * each of the places an agent reads skills from. Kept in step with
 * `/docs/agent-skill`.
 */
const PATHS: InstallPath[] = [
  {
    commands: ['npx medmark'],
    hint: 'The CLI on its own. No agent needed.',
    icon: NpmIcon,
    label: 'npx',
  },
  {
    commands: ['/plugin marketplace add brionmario/medmark', '/plugin install medmark@medmark'],
    hint: 'Run both inside Claude Code, then ask it to convert your archive.',
    icon: ClaudeIcon,
    label: 'Claude Code',
  },
  {
    commands: ['npx skills add brionmario/medmark'],
    hint: 'Installs the skill where Codex looks for it.',
    icon: OpenAiIcon,
    label: 'Codex',
  },
  {
    commands: ['npx skills add brionmario/medmark'],
    hint: 'Same skill, picked up by Cursor and other agents.',
    icon: CursorIcon,
    label: 'Cursor',
  },
  {
    commands: [
      'git clone https://github.com/brionmario/medmark.git /tmp/medmark',
      'cp -R /tmp/medmark/skills/medmark ~/.claude/skills/medmark',
    ],
    hint: 'Copy the skill folder in yourself.',
    icon: FolderCode,
    label: 'Manual',
  },
];

/**
 * The hero's install picker: one tab per way of getting medmark, each with the
 * exact commands and a copy button.
 */
export function InstallTabs() {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);

  const path: InstallPath = PATHS[active]!;
  const text: string = path.commands.join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable, nothing useful to do */
    }
  };

  return (
    <div className="w-full max-w-xl">
      <p className="m-0 text-sm font-medium text-fd-foreground">Get medmark where you work</p>

      <div role="tablist" aria-label="Install medmark" className="mt-3 flex flex-wrap gap-2">
        {PATHS.map(({icon: Icon, label}, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={index === active}
            onClick={() => {
              setActive(index);
              setCopied(false);
            }}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
              index === active
                ? 'border-fd-primary/60 bg-fd-primary/10 text-fd-foreground'
                : 'border-fd-border bg-fd-card text-fd-muted-foreground hover:border-fd-primary/40 hover:text-fd-foreground',
            )}
          >
            <Icon className={cn('size-3.5', index === active && 'text-fd-primary')} />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-3 rounded-lg border border-fd-border bg-fd-card px-4 py-3">
        <pre className="m-0 flex-1 overflow-x-auto bg-transparent break-words whitespace-pre-wrap p-0 font-mono text-sm leading-7 text-fd-foreground">
          <code>
            {path.commands.map((command: string) => (
              <span key={command} className="block">
                <span className="select-none text-fd-primary">$ </span>
                {command}
              </span>
            ))}
          </code>
        </pre>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${text}`}
          className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1.5 text-xs text-fd-muted-foreground transition-colors hover:border-fd-primary/40 hover:text-fd-foreground"
        >
          {copied ? <Check className="size-3.5 text-fd-primary" /> : <Copy className="size-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <p className="mt-2 text-xs text-fd-muted-foreground">{path.hint}</p>
    </div>
  );
}
