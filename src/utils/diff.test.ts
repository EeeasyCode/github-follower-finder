import { describe, expect, it } from 'vitest';
import type { GitHubUser } from '../services/github';
import { calculateDiff } from './diff';

const mockUser = (login: string): GitHubUser => ({
  login,
  avatar_url: '',
  html_url: ''
});

describe('calculateDiff', () => {
  it('should detect new followers', () => {
    const previous = [mockUser('a'), mockUser('b')];
    const current = [mockUser('a'), mockUser('b'), mockUser('c')];
    
    const result = calculateDiff(current, previous);
    
    expect(result.newFollowers).toHaveLength(1);
    expect(result.newFollowers[0].login).toBe('c');
    expect(result.unfollowers).toHaveLength(0);
  });

  it('should detect unfollowers', () => {
    const previous = [mockUser('a'), mockUser('b')];
    const current = [mockUser('a')];
    
    const result = calculateDiff(current, previous);
    
    expect(result.unfollowers).toHaveLength(1);
    expect(result.unfollowers[0].login).toBe('b');
    expect(result.newFollowers).toHaveLength(0);
  });

  it('should handle no changes', () => {
    const previous = [mockUser('a')];
    const current = [mockUser('a')];
    
    const result = calculateDiff(current, previous);
    
    expect(result.newFollowers).toHaveLength(0);
    expect(result.unfollowers).toHaveLength(0);
  });
});
