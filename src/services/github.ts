import { Octokit } from 'octokit';

export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

export class GitHubService {
  private octokit: Octokit | null = null;
  private isTokenMode: boolean = false;

  constructor(token?: string) {
    if (token) {
      this.octokit = new Octokit({ auth: token });
      this.isTokenMode = true;
    } else {
      this.octokit = new Octokit();
      this.isTokenMode = false;
    }
  }

  async getUser(username: string): Promise<GitHubUser> {
    if (!this.octokit) throw new Error('GitHub client not initialized');
    
    try {
      const { data } = await this.octokit.request('GET /users/{username}', {
        username,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
      return {
        login: data.login,
        avatar_url: data.avatar_url,
        html_url: data.html_url
      };
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('User not found');
      }
      if (error.status === 403) {
        throw new Error(this.isTokenMode ? 'API Rate Limit Exceeded' : 'API Rate Limit Exceeded. Please use a token.');
      }
      throw error;
    }
  }

  async getFollowers(username: string, onProgress?: (count: number) => void): Promise<GitHubUser[]> {
    if (!this.octokit) throw new Error('GitHub client not initialized');

    let followers: GitHubUser[] = [];
    let page = 1;
    const per_page = 100;

    while (true) {
      try {
        const response = await this.octokit.request('GET /users/{username}/followers', {
          username,
          per_page,
          page,
          headers: {
            'X-GitHub-Api-Version': '2022-11-28'
          }
        });

        if (response.data.length === 0) break;

        const newFollowers = response.data.map((user: any) => ({
          login: user.login,
          avatar_url: user.avatar_url,
          html_url: user.html_url
        }));

        followers = [...followers, ...newFollowers];
        if (onProgress) onProgress(followers.length);

        if (response.data.length < per_page) break;
        
        // Safety break for no-token mode to prevent accidental abuse/long waits
        if (!this.isTokenMode && page >= 10) { 
           // 1000 followers limit for no-token to avoid hitting 60 req/hr limit instantly
           // actually 10 requests is fine (60 limit).
        }

        page++;
      } catch (error: any) {
        if (error.status === 403) {
           throw new Error(this.isTokenMode ? 'API Rate Limit Exceeded' : 'API Rate Limit Exceeded. Please use a token for large accounts.');
        }
        throw error;
      }
    }

    return followers;
  }
}
