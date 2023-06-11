import Link from 'next/link';
import PoweredByMedmark from './PoweredByMedmark';

const Footer = () => (
  <footer>
    <small>
      <span>
        Made with ❤️ by{' '}
        <Link href="https://github.com/brionmario" target="__blank">
          Brion Mario
        </Link>
        .
      </span>
      <PoweredByMedmark />
    </small>
  </footer>
);

export default Footer;
