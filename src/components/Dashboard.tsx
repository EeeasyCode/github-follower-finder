
import {
  RefreshCw,
  TrendingUp,
  UserMinus,
  UserPlus,
  Users
} from 'lucide-react';
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

interface DailyHistory {
  date: string;
  count: number;
}

// Simple SVG Line Chart Component
const FollowerChart = ({ history }: { history: DailyHistory[] }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number; date: string } | null>(null);

  // Sort history to find the earliest date
  const sortedHistory = [...history].sort((a, b) => a.date.localeCompare(b.date));
  
  // Generate 7-day window starting from the earliest date with data
  const startDate = sortedHistory.length > 0 ? new Date(sortedHistory[0].date) : new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d.toLocaleDateString('en-CA'); // YYYY-MM-DD
  });

  // Map history to the 7-day window
  const chartData = last7Days.map(date => {
    const entry = history.find(h => h.date === date);
    return { date, value: entry ? entry.count : null };
  });

  // Get valid values for Y-axis calculation
  const validValues = chartData.filter(d => d.value !== null).map(d => d.value as number);
  
  // If no data at all, use default values
  const maxVal = validValues.length > 0 ? Math.max(...validValues) : 0;
  const minVal = validValues.length > 0 ? Math.min(...validValues) : 0;

  // Calculate Y-axis range with integer ticks
  let range = maxVal - minVal;
  if (range < 5) range = 5;
  
  const padding = range * 0.2;
  const displayMax = Math.ceil(maxVal + padding);
  const displayMin = Math.max(0, Math.floor(minVal - padding));
  const displayRange = displayMax - displayMin || 1;

  // Generate integer ticks
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const value = Math.round(displayMin + (displayRange * (i / (tickCount - 1))));
    return value;
  });
  // Deduplicate ticks
  const uniqueTicks = [...new Set(ticks)].sort((a, b) => a - b);

  // Create points only for dates with data
  const points = chartData.map((d, i) => {
    if (d.value === null) return null;
    const x = (i / (last7Days.length - 1)) * 100; // Position based on 7-day window
    const y = 100 - ((d.value - displayMin) / displayRange) * 100;
    return { x, y, val: d.value, date: d.date };
  }).filter(p => p !== null) as { x: number, y: number, val: number, date: string }[];

  const pointsString = points.map(p => `${p.x},${p.y}`).join(' ');

  // Calculate growth
  const start = validValues.length > 0 ? validValues[0] : 0;
  const end = validValues.length > 0 ? validValues[validValues.length - 1] : 0;
  const growth = start !== 0 ? ((end - start) / start) * 100 : 0;
  const isPositive = growth >= 0;

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <div>
          <h3 className={styles.chartTitle}>{end}</h3>
          <span className={styles.chartSubtitle}>Total Followers</span>
        </div>
        <div className={styles.chartBadge} style={{ 
          color: isPositive ? '#3fb950' : '#f85149',
          backgroundColor: isPositive ? 'rgba(63, 185, 80, 0.1)' : 'rgba(248, 81, 73, 0.1)'
        }}>
          <TrendingUp size={14} />
          <span>{isPositive ? '+' : ''}{growth.toFixed(1)}%</span>
        </div>
      </div>
      <div className={styles.chartContainer}>
        {hoveredPoint && (
          <div 
            className={`${styles.chartTooltip} ${styles.visible}`}
            style={{ left: `${hoveredPoint.x}%`, top: `${hoveredPoint.y}%` }}
          >
            <span className={styles.tooltipDate}>{new Date(hoveredPoint.date).toLocaleDateString()}</span>
            <span className={styles.tooltipValue}>{hoveredPoint.value} Followers</span>
          </div>
        )}
        {/* Grid Lines and Y-Axis Labels */}
        {uniqueTicks.map((value) => {
          // Calculate position based on value relative to display range
          const ratio = (value - displayMin) / displayRange;
          const yPos = 100 - (ratio * 100);
          return (
            <React.Fragment key={value}>
              <div 
                className={styles.chartGridLine} 
                style={{ top: `${yPos}%` }} 
              />
              <div 
                className={styles.chartYLabel} 
                style={{ top: `${yPos}%` }}
              >
                {value}
              </div>
            </React.Fragment>
          );
        })}

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className={styles.chartSvg}>
          {/* Render Line only if we have more than 1 point */}
          {points.length > 1 && (
            <polyline
              points={pointsString}
              fill="none"
              stroke="#58a6ff"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* HTML Overlay for Points and Lines to avoid SVG scaling distortion */}
        <div className={styles.chartOverlay}>
          {points.map((p, i) => (
            <React.Fragment key={i}>
              {/* Vertical Dashed Line */}
              <div 
                className={styles.chartDashedLine}
                style={{ 
                  left: `${p.x}%`, 
                  top: `${p.y}%`,
                  height: `${100 - p.y}%`
                }}
              />
              
              {/* Data Point */}
              <div
                className={styles.chartPoint}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                onMouseEnter={() => setHoveredPoint({ x: p.x, y: p.y, value: p.val, date: p.date })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </React.Fragment>
          ))}
        </div>
        
        {/* X-Axis Labels - always show all 7 days */}
        {last7Days.map((dateStr, i) => {
           const date = new Date(dateStr);
           const label = date.toLocaleDateString('en-US', { weekday: 'short' });
           const x = (i / (last7Days.length - 1)) * 100;
           return (
             <div 
               key={`label-${i}`}
               className={styles.chartXLabel}
               style={{ left: `${x}%` }}
             >
               {label}
             </div>
           );
        })}
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ username, token, onLogout }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diff, setDiff] = useState<DiffResult | null>(null);
  const [history, setHistory] = useState<DailyHistory[]>([]);
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

      // 4. Save new snapshot & history
      await storage.saveSnapshot(username, currentFollowers);
      
      // 5. Load history
      const historyData = await storage.getHistory(username);
      setHistory(historyData);

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

  // Calculate growth rate for the stats card
  const calculateGrowthRate = () => {
    if (history.length < 2) return 0;
    const start = history[0].count;
    const end = history[history.length - 1].count;
    if (start === 0) return 0;
    return ((end - start) / start) * 100;
  };

  const growthRate = calculateGrowthRate();

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.welcome}>Dashboard</h2>
          <p className={styles.lastCheck}>Overview for {username}</p>
        </div>
        <div className={styles.actions}>
          <button onClick={fetchData} className="btn btn-secondary">
            <RefreshCw size={16} style={{ marginRight: '0.5rem' }} />
            Refresh
          </button>
          <button onClick={onLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      {/* Chart Section */}
      <FollowerChart history={history} />

      {/* Stats Grid (2x2) */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statValue}>{diff.totalCurrent}</span>
            <div className={styles.statIcon} style={{ color: '#58a6ff', background: 'rgba(88, 166, 255, 0.1)' }}>
              <Users size={20} />
            </div>
          </div>
          <div className={styles.statBody}>
            <span className={styles.statLabel}>Total Followers</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: '100%', backgroundColor: '#58a6ff' }}></div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statValue}>{diff.newFollowers.length}</span>
            <div className={styles.statIcon} style={{ color: '#3fb950', background: 'rgba(63, 185, 80, 0.1)' }}>
              <UserPlus size={20} />
            </div>
          </div>
          <div className={styles.statBody}>
            <span className={styles.statLabel}>New Followers</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${Math.min(diff.newFollowers.length * 10, 100)}%`, backgroundColor: '#3fb950' }}></div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statValue}>{diff.unfollowers.length}</span>
            <div className={styles.statIcon} style={{ color: '#f85149', background: 'rgba(248, 81, 73, 0.1)' }}>
              <UserMinus size={20} />
            </div>
          </div>
          <div className={styles.statBody}>
            <span className={styles.statLabel}>Unfollowers</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${Math.min(diff.unfollowers.length * 10, 100)}%`, backgroundColor: '#f85149' }}></div>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
           <div className={styles.statHeader}>
            <span className={styles.statValue}>{growthRate.toFixed(1)}%</span>
            <div className={styles.statIcon} style={{ color: '#a371f7', background: 'rgba(163, 113, 247, 0.1)' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div className={styles.statBody}>
            <span className={styles.statLabel}>Growth Rate</span>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${Math.min(Math.abs(growthRate) * 5, 100)}%`, backgroundColor: '#a371f7' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Lists */}
      <div className={styles.listsGrid}>
        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <h3 className={styles.listTitle}>
              <UserMinus size={18} className={styles.listIcon} style={{ color: '#f85149' }} />
              Recent Unfollowers
            </h3>
          </div>
          {diff.unfollowers.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No new unfollowers</p>
            </div>
          ) : (
            <ul className={styles.userList}>
              {diff.unfollowers.map(user => (
                <li key={user.login} className={styles.userItem}>
                  <img src={user.avatar_url} alt={user.login} className={styles.avatar} />
                  <div className={styles.userInfo}>
                    <span className={styles.username}>{user.login}</span>
                    <a href={user.html_url} target="_blank" rel="noreferrer" className={styles.profileLink}>
                      View
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={styles.listCard}>
          <div className={styles.listHeader}>
            <h3 className={styles.listTitle}>
              <UserPlus size={18} className={styles.listIcon} style={{ color: '#3fb950' }} />
              New Followers
            </h3>
          </div>
          {diff.newFollowers.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No new followers</p>
            </div>
          ) : (
            <ul className={styles.userList}>
              {diff.newFollowers.map(user => (
                <li key={user.login} className={styles.userItem}>
                  <img src={user.avatar_url} alt={user.login} className={styles.avatar} />
                  <div className={styles.userInfo}>
                    <span className={styles.username}>{user.login}</span>
                    <a href={user.html_url} target="_blank" rel="noreferrer" className={styles.profileLink}>
                      View
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

