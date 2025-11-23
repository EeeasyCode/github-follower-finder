import type { GitHubUser } from '../services/github';

export interface DiffResult {
  newFollowers: GitHubUser[];
  unfollowers: GitHubUser[];
  totalCurrent: number;
  totalPrevious: number;
}

export function calculateDiff(current: GitHubUser[], previous: GitHubUser[]): DiffResult {
  const currentSet = new Set(current.map(u => u.login));
  const previousSet = new Set(previous.map(u => u.login));

  const newFollowers = current.filter(u => !previousSet.has(u.login));
  const unfollowers = previous.filter(u => !currentSet.has(u.login));

  return {
    newFollowers,
    unfollowers,
    totalCurrent: current.length,
    totalPrevious: previous.length
  };
}
