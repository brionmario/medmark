import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { MedmarkLogo } from '@/components/logo';
import { gitConfig } from './shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <MedmarkLogo height={22} className="text-fd-foreground" />,
    },
    links: [
      { text: 'Documentation', url: '/docs' },
      { text: 'Showcase', url: '/showcase' },
    ],
    githubUrl: `https://github.com/${gitConfig.user}/${gitConfig.repo}`,
  };
}
