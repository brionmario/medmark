import {useTheme} from 'nextra-theme-blog';
import {useEffect, useState} from 'react';

const PoweredByMedmark = () => {
  const {resolvedTheme} = useTheme();
  const [logo, setLogo] = useState('/assets/images/medmark-logo.svg');

  useEffect(
    () =>
      setLogo(resolvedTheme === 'dark' ? '/assets/images/medmark-logo-light.svg' : '/assets/images/medmark-logo.svg'),
    [resolvedTheme],
  );

  return (
    <span className="powered-by-medmark">
      Powered by <img src={logo} title="Medmark" />.
    </span>
  );
};

export default PoweredByMedmark;
