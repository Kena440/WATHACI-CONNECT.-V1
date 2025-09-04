import React from 'react';

interface LogoProps {
  className?: string;
}

/**
 * Displays the WATHACI CONNECT logo.
 * Centralizes logo usage across the app.
 */
const Logo: React.FC<LogoProps> = ({ className }) => (
  <img
    src="/logo.svg"
    alt="WATHACI CONNECT"
    loading="lazy"
    decoding="async"
    className={className}
  />
);

export { Logo };
export default Logo;
