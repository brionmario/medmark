import site, {type SiteLink} from '@/site.config';

export default function SiteFooter() {
  const year: number = new Date().getFullYear();

  return (
    <footer className="border-line mt-auto border-t">
      <div className="text-soft mx-auto flex w-full max-w-[46rem] flex-wrap items-center justify-between gap-3 px-5 py-7 text-xs">
        <p>
          © {year} {site.name}
        </p>
        <ul className="flex flex-wrap items-center gap-4">
          {site.links.map((link: SiteLink) => (
            <li key={link.href}>
              <a
                className="hover:text-ink transition-colors"
                href={link.href}
                rel={link.href.startsWith('http') ? 'me noreferrer' : undefined}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
