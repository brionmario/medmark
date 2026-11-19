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
  /** What each line is typed into: a shell, or the agent's own prompt. */
  prompt: '$' | '>';
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Tab text, e.g. "Claude Code". */
  label: string;
  /**
   * The mark's own colour. npm and Claude have one; OpenAI and Cursor use a
   * black-or-white wordmark, so they follow the text instead.
   */
  tone: string;
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
    prompt: '$',
    icon: NpmIcon,
    label: 'npx',
    tone: 'text-[#CB3837]',
  },
  {
    commands: ['/plugin marketplace add brionmario/medmark', '/plugin install medmark@medmark'],
    hint: 'Type these into Claude Code itself, one after the other, then ask it to convert your archive.',
    prompt: '>',
    icon: ClaudeIcon,
    label: 'Claude Code',
    tone: 'text-[#D97757]',
  },
  {
    commands: ['npx skills add brionmario/medmark'],
    hint: 'Installs the skill where Codex looks for it.',
    prompt: '$',
    icon: OpenAiIcon,
    label: 'Codex',
    tone: 'text-black dark:text-white',
  },
  {
    commands: ['npx skills add brionmario/medmark'],
    hint: 'Same skill, picked up by Cursor and other agents.',
    prompt: '$',
    icon: CursorIcon,
    label: 'Cursor',
    tone: 'text-black dark:text-white',
  },
  {
    commands: [
      'git clone https://github.com/brionmario/medmark.git /tmp/medmark',
      'cp -R /tmp/medmark/skills/medmark ~/.claude/skills/medmark',
    ],
    hint: 'Copy the skill folder in yourself.',
    prompt: '$',
    icon: FolderCode,
    label: 'Manual',
    tone: 'text-fd-muted-foreground',
  },
];

/**
 * The hero's install picker: one tab per way of getting medmark, each with the
 * exact commands and a copy button.
 */
export function InstallTabs() {
  const [active, setActive] = useState(0);
  /** Index of the command copied a moment ago, or -1. */
  const [copied, setCopied] = useState(-1);

  const path: InstallPath = PATHS[active]!;

  const copy = async (command: string, index: number) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(index);
      setTimeout(() => setCopied(-1), 2000);
    } catch {
      /* clipboard unavailable, nothing useful to do */
    }
  };

  return (
    <div className="w-full max-w-xl">
      <p className="m-0 text-sm font-medium text-fd-foreground">Get medmark where you work</p>

      <div role="tablist" aria-label="Install medmark" className="mt-3 flex flex-wrap gap-2">
        {PATHS.map(({icon: Icon, label, tone}, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={index === active}
            onClick={() => {
              setActive(index);
              setCopied(-1);
            }}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors',
              index === active
                ? 'border-fd-primary/60 bg-fd-primary/10 text-fd-foreground'
                : 'border-fd-border bg-fd-card text-fd-muted-foreground hover:border-fd-primary/40 hover:text-fd-foreground',
            )}
          >
            <Icon className={cn('size-3.5', tone)} />
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 divide-y divide-fd-border rounded-lg border border-fd-border bg-fd-card">
        {path.commands.map((command: string, index: number) => (
          <div key={command} className="flex items-start gap-3 px-4 py-3">
            {path.commands.length > 1 && (
              <span className="mt-1 shrink-0 font-mono text-xs text-fd-muted-foreground">{index + 1}.</span>
            )}
            <code className="flex-1 font-mono text-sm leading-6 break-words whitespace-pre-wrap text-fd-foreground">
              <span className="select-none text-fd-primary">{path.prompt} </span>
              {command}
            </code>
            <button
              type="button"
              onClick={() => copy(command, index)}
              aria-label={`Copy ${command}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-fd-border px-2.5 py-1.5 text-xs text-fd-muted-foreground transition-colors hover:border-fd-primary/40 hover:text-fd-foreground"
            >
              {copied === index ? <Check className="size-3.5 text-fd-primary" /> : <Copy className="size-3.5" />}
              {copied === index ? 'Copied' : 'Copy'}
            </button>
          </div>
        ))}
      </div>

      <p className="mt-2 text-xs text-fd-muted-foreground">{path.hint}</p>
    </div>
  );
}
