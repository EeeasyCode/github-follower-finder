import { Bug, Github, MessageSquare, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

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
      
      {isMenuOpen && (
        <div className={styles.feedbackMenu} ref={menuRef}>
          <a 
            href="https://forms.gle/DUZcPoab9DckVj6t8" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.feedbackMenuItem}
            onClick={() => setIsMenuOpen(false)}
          >
            <Bug size={18} />
            <span>Bug Report & Feature Request</span>
          </a>
        </div>
      )}

      <button 
        ref={buttonRef}
        className={`${styles.feedbackButton} ${isMenuOpen ? styles.feedbackButtonOpen : ''}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        title={isMenuOpen ? "Close Menu" : "Feedback Menu"}
        aria-label={isMenuOpen ? "Close menu" : "Open feedback menu"}
        aria-expanded={isMenuOpen}
      >
        {isMenuOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};
