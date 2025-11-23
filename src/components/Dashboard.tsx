import { ExternalLink, RefreshCw, UserMinus, UserPlus, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { GitHubService } from '../services/github';
import { StorageService } from '../services/storage';
import { calculateDiff, type DiffResult } from '../utils/diff';
import styles from './Dashboard.module.css';

interface DashboardProps {
  username: string;
  token: string | null;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ username, token, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [progress, setProgress] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const github = new GitHubService(token || undefined);
      const storage = new StorageService();

      // 1. Fetch current followers
      const currentFollowers = await github.getFollowers(username, (count) => {
        setProgress(count);
      });

      // 2. Load previous snapshot
      const snapshot = await storage.getSnapshot(username);
      const previousFollowers = snapshot ? snapshot.followers : [];

      // 3. Calculate diff
      const result = calculateDiff(currentFollowers, previousFollowers);
      setDiff(result);

      // 4. Save new snapshot
      await storage.saveSnapshot(username, currentFollowers);

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [username, token]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <RefreshCw className={`${styles.spinner} ${styles.icon}`} size={48} />
        <p>Fetching followers... ({progress})</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorCard}>
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={onLogout} className="btn btn-secondary">Go Back</button>
        </div>
      </div>
    );
  }

  if (!diff) return null;

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.welcome}>Hello, {username}</h2>
          <p className={styles.lastCheck}>
            Compared to {diff.totalPrevious === 0 ? 'initial check' : 'last check'}
          </p>
        </div>
        <div className={styles.actions}>
          <button onClick={fetchData} className="btn btn-secondary">
            <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
            Refresh
          </button>
          <button onClick={onLogout} className="btn btn-secondary">
            Change User
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
            <Users size={24} />
          </div>
          <div>
            <p className={styles.statLabel}>Total Followers</p>
            <p className={styles.statValue}>{diff.totalCurrent}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' }}>
            <UserPlus size={24} />
          </div>
          <div>
            <p className={styles.statLabel}>New Followers</p>
            <p className={styles.statValue}>+{diff.newFollowers.length}</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <UserMinus size={24} />
          </div>
          <div>
            <p className={styles.statLabel}>Unfollowers</p>
            <p className={styles.statValue}>-{diff.unfollowers.length}</p>
          </div>
        </div>
      </div>

      <div className={styles.listsGrid}>
        <div className="card">
          <h3 className={styles.listTitle} style={{ color: '#ef4444' }}>
            <UserMinus size={20} /> Unfollowers
          </h3>
          {diff.unfollowers.length === 0 ? (
            <p className={styles.emptyState}>No one unfollowed you. Hooray!</p>
          ) : (
            <ul className={styles.userList}>
              {diff.unfollowers.map(user => (
                <li key={user.login} className={styles.userItem}>
                  <img src={user.avatar_url} alt={user.login} className={styles.avatar} />
                  <div className={styles.userInfo}>
                    <span className={styles.username}>{user.login}</span>
                    <a href={user.html_url} target="_blank" rel="noreferrer" className={styles.profileLink}>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3 className={styles.listTitle} style={{ color: '#22c55e' }}>
            <UserPlus size={20} /> New Followers
          </h3>
          {diff.newFollowers.length === 0 ? (
            <p className={styles.emptyState}>No new followers yet.</p>
          ) : (
            <ul className={styles.userList}>
              {diff.newFollowers.map(user => (
                <li key={user.login} className={styles.userItem}>
                  <img src={user.avatar_url} alt={user.login} className={styles.avatar} />
                  <div className={styles.userInfo}>
                    <span className={styles.username}>{user.login}</span>
                    <a href={user.html_url} target="_blank" rel="noreferrer" className={styles.profileLink}>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
