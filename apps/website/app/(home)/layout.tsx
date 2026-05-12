import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { baseOptions } from '@/lib/layout.shared';

export default function Layout({ children }: LayoutProps<'/'>) {
  const opts = baseOptions();
  return (
    <HomeLayout
      {...opts}
      nav={{ ...opts.nav, transparentMode: 'always' }}
    >
      {children}
    </HomeLayout>
  );
}
