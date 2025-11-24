import { useEffect, useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Layout } from './components/Layout';
import { SetupForm } from './components/SetupForm';

function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [step, setStep] = useState<'setup' | 'dashboard'>('setup');

  useEffect(() => {
    const storedUsername = localStorage.getItem('github_username');
    const storedToken = localStorage.getItem('github_token');
    if (storedUsername) {
      setUsername(storedUsername);
      setToken(storedToken);
      setStep('dashboard');
    }
  }, []);

  const handleLogin = (user: string, token: string | null) => {
    setUsername(user);
    setToken(token);
    localStorage.setItem('github_username', user);
    if (token) {
      localStorage.setItem('github_token', token);
    } else {
      localStorage.removeItem('github_token');
    }
    setStep('dashboard');
  };

  const handleLogout = () => {
    setUsername('');
    setToken(null);
    localStorage.removeItem('github_username');
    localStorage.removeItem('github_token');
    setStep('setup');
  };

  return (
    <Layout>
      {step === 'setup' ? (
        <SetupForm onSubmit={handleLogin} isLoading={false} />
      ) : (
        <Dashboard 
          username={username || ''} 
          token={token} 
          onLogout={handleLogout} 
        />
      )}
    </Layout>
  );
}


export default App;
