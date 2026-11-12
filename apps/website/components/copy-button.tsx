'use client';

import {useState} from 'react';
import {Check, Copy} from 'lucide-react';
import {cn} from '@/lib/cn';

interface CopyButtonProps {
  className?: string;
  /** Shown instead of the raw value, e.g. with a `$` prefix. */
  label?: string;
  value: string;
}

/**
 * A command chip that copies its value to the clipboard.
 */
export function CopyButton({className, label, value}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — nothing useful to do */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${value}`}
      className={cn(
        'group inline-flex items-center gap-2 rounded-lg border border-fd-border bg-fd-card px-4 py-2.5',
        'font-mono text-sm text-fd-foreground transition-colors hover:border-fd-primary/40 hover:bg-fd-accent',
        className,
      )}
    >
      <span className="select-none text-fd-primary">$</span>
      <span>{label ?? value}</span>
      {copied ? (
        <Check className="size-3.5 text-fd-primary" />
      ) : (
        <Copy className="size-3.5 text-fd-muted-foreground transition-colors group-hover:text-fd-foreground" />
      )}
    </button>
  );
}
