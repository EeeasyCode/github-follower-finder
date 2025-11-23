import { Key, Search, ShieldAlert } from 'lucide-react';
import React, { useState } from 'react';
import styles from './SetupForm.module.css';

interface SetupFormProps {
  onSubmit: (username: string, token: string | null) => void;
  isLoading: boolean;
}

export const SetupForm: React.FC<SetupFormProps> = ({ onSubmit, isLoading }) => {
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [useToken, setUseToken] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    onSubmit(username, useToken ? token : null);
  };

  return (
    <div className={styles.container}>
      <div className={`card ${styles.formCard}`}>
        <h2 className={styles.title}>Get Started</h2>
        <p className={styles.subtitle}>Enter your GitHub username to track your followers.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>GitHub Username</label>
            <div className={styles.inputWrapper}>
              <Search className={styles.icon} size={20} />
              <input
                type="text"
                className="input"
                placeholder="e.g. octocat"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.modeToggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${useToken ? styles.active : ''}`}
              onClick={() => setUseToken(true)}
            >
              Use Token (Recommended)
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${!useToken ? styles.active : ''}`}
              onClick={() => setUseToken(false)}
            >
              No Token (Limited)
            </button>
          </div>

          {useToken ? (
            <div className={`${styles.field} animate-fade-in`}>
              <label className={styles.label}>
                Personal Access Token
                <a 
                  href="https://github.com/settings/tokens/new?scopes=read:user" 
                  target="_blank" 
                  rel="noreferrer"
                  className={styles.link}
                >
                  (Get one here)
                </a>
              </label>
              <div className={styles.inputWrapper}>
                <Key className={styles.icon} size={20} />
                <input
                  type="password"
                  className="input"
                  placeholder="ghp_..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required={useToken}
                />
              </div>
              <p className={styles.hint}>
                Token is only stored in your browser's memory and used to communicate directly with GitHub.
              </p>
            </div>
          ) : (
            <div className={`${styles.warning} animate-fade-in`}>
              <ShieldAlert size={20} />
              <p>
                Without a token, you are limited to 60 requests per hour. 
                Large accounts (1000+ followers) may hit limits immediately.
              </p>
            </div>
          )}

          <button 
            type="submit" 
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={isLoading}
          >
            {isLoading ? 'Checking...' : 'Check Followers'}
          </button>
        </form>
      </div>
    </div>
  );
};
