import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import PageNavigator from './PageNavigator';

interface AppLayoutProps {
  children?: ReactNode;
  showHomeContent?: boolean;
}

export const AppLayout = ({ children, showHomeContent = false }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {showHomeContent ? (
          <>
            {/* Import components only when needed for home page */}
            {children}
          </>
        ) : (
          children
        )}
        <PageNavigator />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;