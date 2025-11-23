import { Github } from 'lucide-react';
import React from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={`container ${styles.headerContent}`}>
          <div className={styles.logo}>
            <Github className={styles.icon} size={28} />
            <h1 className={styles.title}>GitHub Unfollower Finder</h1>
          </div>
          {/* Future: Theme Toggle */}
        </div>
      </header>
      <main className={`container ${styles.main}`}>
        {children}
      </main>
      <footer className={styles.footer}>
        <div className="container">
          <p>© 2025 GitHub Unfollower Finder. Privacy First - Data stored locally.</p>
        </div>
      </footer>
    </div>
  );
};
