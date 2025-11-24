import { ArrowRight, Key, Search, ShieldAlert } from 'lucide-react';
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
        <div className={styles.header}>
          <h2 className={styles.title}>GitHub Tracker</h2>
          <p className={styles.subtitle}>Track your followers and unfollowers</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <div className={styles.inputWrapper}>
              <Search className={styles.icon} size={20} />
              <input
                type="text"
                className="input"
                placeholder="github_username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
              />
            </div>
          </div>

          <div className={styles.modeToggle}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${useToken ? styles.active : ''}`}
              onClick={() => setUseToken(true)}
            >
              Use Token
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${!useToken ? styles.active : ''}`}
              onClick={() => setUseToken(false)}
            >
              No Token
            </button>
          </div>

          {useToken ? (
            <div className={`${styles.field} animate-fade-in`}>
              <label className={styles.label}>
                Access Token
                <a 
                  href="https://github.com/settings/tokens/new?scopes=read:user" 
                  target="_blank" 
                  rel="noreferrer"
                  className={styles.link}
                >
                  Create Token →
                </a>
              </label>
              <div className={styles.inputWrapper}>
                <Key className={styles.icon} size={20} />
                <input
                  type="password"
                  className="input"
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required={useToken}
                />
              </div>
              <p className={styles.hint}>
                Token is stored locally and used only for GitHub API requests.
              </p>
            </div>
          ) : (
            <div className={`${styles.warning} animate-fade-in`}>
              <ShieldAlert size={20} className="flex-shrink-0" />
              <p>
                Limited to 60 requests/hour. Recommended only for small accounts.
              </p>
            </div>
          )}

          <button 
            type="submit" 
            className={`btn btn-primary ${styles.submitBtn}`}
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Start Tracking'}
            {!isLoading && <ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};
