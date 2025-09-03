import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Ordered routes for sequential navigation
const routes = [
  '/',
  '/marketplace',
  '/freelancer-hub',
  '/resources',
  '/partnership-hub',
  '/funding-hub',
  '/about'
];

const PageNavigator: React.FC = () => {
  const location = useLocation();
  const currentIndex = routes.indexOf(location.pathname);

  const prevPath = currentIndex > 0 ? routes[currentIndex - 1] : null;
  const nextPath =
    currentIndex !== -1 && currentIndex < routes.length - 1
      ? routes[currentIndex + 1]
      : null;

  return (
    <nav className="flex justify-between py-4">
      {prevPath ? (
        <Link
          to={prevPath}
          className="px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700"
        >
          &larr; Prev
        </Link>
      ) : (
        <span />
      )}

      {nextPath && (
        <Link
          to={nextPath}
          className="ml-auto px-4 py-2 rounded bg-orange-600 text-white hover:bg-orange-700"
        >
          Next &rarr;
        </Link>
      )}
    </nav>
  );
};

export default PageNavigator;
