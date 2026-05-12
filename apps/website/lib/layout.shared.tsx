import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { gitConfig } from './shared';

function MedmarkIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0H20.588V80H0V0Z" fill="#0B6B43" />
      <path d="M20.588 0L39.9996 29.4118L59.4112 0H79.9993L39.9996 58.8235L0 0H20.588Z" fill="#4DBA8B" />
      <path d="M59.4121 0H80.0002V80H59.4121V0Z" fill="#D9E1E3" />
      <path opacity="0.7" d="M59.4121 0H80.0002L59.4121 29.4118V0Z" fill="#BFC9CC" />
      <path opacity="0.35" d="M0 0H20.588V20.5882L0 0Z" fill="#145C45" />
    </svg>
  );
}

function NavLogo() {
  return (
    <span className="flex items-center gap-2">
      <MedmarkIcon size={26} />
      <span className="text-sm font-semibold tracking-tight">medmark</span>
    </span>
  );
}

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <NavLogo />,
    },
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
