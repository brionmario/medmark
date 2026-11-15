import Link from 'next/link';
import site, {type SiteLink} from '@/site.config';
import ThemeToggle from './theme-toggle';

/** Header navigation, minus any link to a page the config leaves empty. */
function navigation(): SiteLink[] {
  return site.nav.filter((item: SiteLink) => !(item.href.startsWith('/about') && site.about.length === 0));
}

export default function SiteHeader() {
  const nav: SiteLink[] = navigation();

  return (
    <header className="border-line bg-paper/85 sticky top-0 z-10 border-b backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[46rem] items-center justify-between px-5">
        <Link className="hover:text-accent font-serif text-lg tracking-tight transition-colors" href="/">
          {site.name}
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          {nav.length > 1 &&
            nav.map((item: SiteLink) => (
              <Link className="text-soft hover:text-ink transition-colors" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
