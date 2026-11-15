'use client';

import {useEffect, useState} from 'react';

/** Light/dark switch. The choice is remembered; until then the OS decides. */
export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  // Follow the OS while the reader has not made a choice of their own.
  useEffect(() => {
    const query: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent): void => {
      if (localStorage.getItem('theme')) {
        return;
      }

      document.documentElement.classList.toggle('dark', event.matches);
      setDark(event.matches);
    };

    query.addEventListener('change', onChange);

    return () => query.removeEventListener('change', onChange);
  }, []);

  const toggle = (): void => {
    const next: boolean = !document.documentElement.classList.contains('dark');

    document.documentElement.classList.toggle('dark', next);

    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // Private browsing — the toggle still works for this page view.
    }

    setDark(next);
  };

  return (
    <button
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="text-soft hover:text-ink -mr-1.5 cursor-pointer rounded-full p-1.5 transition-colors"
      onClick={toggle}
      type="button"
    >
      <svg
        aria-hidden="true"
        fill="none"
        height="17"
        stroke="currentColor"
        strokeWidth="1.6"
        viewBox="0 0 24 24"
        width="17"
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path
              d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"
              strokeLinecap="round"
            />
          </>
        ) : (
          <path
            d="M20 14.2A8.2 8.2 0 1 1 9.8 4a6.9 6.9 0 0 0 10.2 10.2Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </button>
  );
}
